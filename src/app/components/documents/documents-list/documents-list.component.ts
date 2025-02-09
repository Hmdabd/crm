import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API_PATH } from '@constants/api-end-points';
import { Roles, SETTINGS } from '@constants/constants';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { debounceTime, distinctUntilChanged, filter, fromEvent, lastValueFrom, Subscription, switchMap, tap } from 'rxjs';
import * as Constants from '@constants/constants';

@Component({
    selector: 'app-documents-list',
    templateUrl: './documents-list.component.html',
    styleUrls: ['../../../styles/dashboard.scss', './documents-list.component.scss', '../../../styles/predictive-search.scss']
})
export class DocumentsListComponent implements OnInit {
    page: number = 1;
    documentsList: Array<any> = [];
    //  leaddocumentsList: Object[] = [];
    leaddocumentsList: Array<any> = [];
    hasMoreDocs: boolean = false;
    limit: number = 10;
    modal!: NgbModalRef;
    totalDocs: number = 0;
    uploading: boolean = false;
    search: string = '';
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: string = '';
    maxDate!: NgbDateStruct;
    @ViewChild('datepicker') datepicker: any;
    documentDetails: any = {};
    selectedFiles: any[] = [];
    docTypes: any[] = [];
    filesForm: FormGroup | any;
    roles = Roles;
    companyListPage: number = 1;
    companySearch: string = '';
    companiesList: Array<any> = [];
    submittersList: Array<any> = [];
    hasMoreCompanies: boolean = false;
    company: string | null = null;
    user: string | null = null;
    userListPage: number = 1;
    usersSearch: string = '';
    usersList: Array<any> = [];
    hasMoreUsers: boolean = false;

    leadId: string | null = null;
    LeadsList: any[] = [];
    leadPage: number = 1;
    companyLeads: any[] = [];
    hasMoreLeads: boolean = false;
    leadOfCompany: string | null = null;
    leadSearch: string = '';
    userRole: string = '';
    dateFormat: string = '';
    timeZone: string = ''
    predictiveSearchResults: Array<any> = [];
    canRenameDoc: boolean = false;
    canDeleteDoc: boolean = false;
    canViewDoc: boolean = false;
    canDownloadDoc: boolean = false;
    predictiveSearchId: string = '';
    actualdocTypes: Array<any> = [];
    nowDate!: string;
    @ViewChild('predictiveSearch', { static: false }) predictiveSearch!: ElementRef;
    @ViewChild('ownerDob', { static: false }) ownerDob!: ElementRef;
    dashboardData: any = {};
    canListLead: boolean = false;
    colorSubs!: Subscription;
    color!: string;
    searchOrder = {
        order: 'DESC',
        sortby: 'created_at'
    }
    range: any = [];
    startYear = new Date().getFullYear();
    documentDateCheck = new Date();
    companyDocuments: Array<any> = [];
    tabView: string = 'Company'
    style!: { fill: string; };
    companyType: string = '';
    companytabView: string = 'Documents to Sent'
    tabViewCompnay:string = 'sent';
    documentLength:Number = 0;

    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private authService: AuthService,
        private ngxLoader: NgxUiLoaderService

    ) { }

    ngOnInit(): void {
        // this.commonService.showSpinnerWithId('uploading');
        this.documentYear()
        this.canListLead = this.authService.hasPermission('lead-list');

        this.getDocumentTypes();
        this.maxDate = this.calendar.getToday();
        let d = new Date();
        let day: any = d.getDate();
        if (day.toString().length < 2) {
            day = '0' + day;
        } let month: string | number = (d.getMonth() + 1);
        if (month.toString().length < 2) {
            month = '0' + month;
        }
        this.nowDate = `${month}-${day}-${d.getFullYear()}`
        // this.nowDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
        this.getDocsList();
        this.getCompanyDocsList();
        this.initForm();
        this.getUserDetails();
        // this.getCompanyBasedLeads()
        this.canViewDoc = this.authService.hasPermission('document-view');
        this.canRenameDoc = this.authService.hasPermission('document-update');
        this.canDeleteDoc = this.authService.hasPermission('document-delete');
        this.canDownloadDoc = this.authService.hasPermission('document-download');
        switch (this.userRole) {
            case Roles.ADMINISTRATOR:
                // this.getCompaniesList();
                this.getUsersList();
                break;
            case Roles.COMPANY:
                this.getLeadsList();
                break;
            default:
                break;
        }
    }

    ngAfterViewInit() {
        this.initOwnerDob();
        fromEvent(this.predictiveSearch.nativeElement, 'keyup').pipe(
            tap(() => {
                if (!this.predictiveSearch.nativeElement.value) {
                    this.predictiveSearchResults = [];
                }
            }),
            filter(() => this.predictiveSearch.nativeElement.value && this.predictiveSearch.nativeElement.value.length > 0),
            debounceTime(200),
            distinctUntilChanged(),
            switchMap(() => this.apiService.postReq(API_PATH.PREDICTIVE_SEARCH, { search: this.predictiveSearch.nativeElement.value, records_per_search: 500, type: this.tabView == 'Lead' ?'document': 'company_document' }, 'document', 'list'))
        ).subscribe((res) => {
            if (res && res.status_code == "200") {
                this.predictiveSearchResults = res.data;

            } else {
                this.predictiveSearchResults = [];
            }
        })
    }
    /**
     * @description get logged in user details
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.userRole = ud.role;
            this.timeZone = ud.time_zone;
            this.dateFormat = ud.date_format;
            this.companyType = ud.company_type
            this.getColorOnUpdate();
            this.color = ud?.color;
            this.style = { fill: ud?.color };
            // this.stroke={stroke:ud?.color};
            // switch (ud.role) {
            //     case Roles.ADMINISTRATOR:
            //         // this.getCompaniesList();
            //         this.getUsersList();
            //         break;
            //     case Roles.COMPANY:
            //         this.getLeadsList();
            //         break;
            //     default:
            //         break;
            // }
        }
    }
    // getDate(date: any) {
    //     return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)

    // }
    getDate(date: any) {
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }


    async getLeadsList() {
        try {
            let url = `?sort_by=first_name&dir=ASC&records_per_page=50&page=${this.leadPage}`;
            if (this.leadSearch) {
                url = url + `&search=${this.leadSearch}`
            }
            const res$ = this.apiService.getReq(API_PATH.LEAD_LIST + url, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (response.data && response.data.data) {
                    if (this.leadPage === 1) {
                        this.LeadsList = response.data.data;
                    } else {
                        this.LeadsList = [...this.LeadsList, ...response.data.data];
                    }

                    this.leadPage < response.data.last_page ? this.hasMoreLeads = true : this.hasMoreLeads = false;
                } else {
                    this.LeadsList = [];
                    this.leadId = null;
                }
            }
        } catch (error) {
            this.commonService.showErrorMessage(error);
        }
    }

    onLeadSearch(value: { term: string, items: any[] }) {
        if (value.term) {
            this.leadSearch = value.term
        } else {
            this.leadSearch = '';
        }
        this.leadPage = 1;
        this.getLeadsList();
    }

    getMoreLeads() {
        if (this.hasMoreLeads) {
            this.leadPage++;
            this.getLeadsList();
        }
    }

    initForm() {
        this.filesForm = this.fb.group({
            files: this.fb.array([])
        })
    }

    get formFileArray() {
        return this.filesForm.get('files') as FormArray;
    }

    addFileToForm(file: File) {
        this.formFileArray.push(this.fb.group({
            fileName: [file.name],
            doc_type: ['', ] ,
            // [Validators.required]
            // doc_name: ['', [
            //     Validators.required, 
            //     Validators.pattern(Custom_Regex.spaces),
            //     Validators.pattern(Custom_Regex.username), 
            //     Validators.pattern(Custom_Regex.name),
            //     Validators.maxLength(100), 
            //     Validators.minLength(3)
            // ]],
            doc_name: [''],
            // document_date: [null],
            document_month: [''],
            document_year: [''],
            doc_note: [''],
            file: [file]
        }))
    }

    removeFileFromArray(i: number) {
        this.formFileArray.removeAt(i);
    }
    async getDocsList() {
        try {
            this.commonService.showSpinner();
            let url = `?sort_by=${this.searchOrder.sortby}&dir=${this.searchOrder.order}&page_limit=${this.limit}&page=${this.page}&type=${this.tabView}`;
            let reqData: any = {
                page: this.page,
                records_per_page: this.limit,
                sort_by: this.searchOrder.sortby,
                dir: this.searchOrder.order
            }
            if (this.search && this.predictiveSearchId) {
                reqData.name = this.predictiveSearchId;
                url = url + `&name=${this.predictiveSearchId}`;
            }
            if (this.search && !this.predictiveSearchId) {
                reqData.name = this.search
                url = url + `&name=${this.search}`;
            }
            // if (this.search) {
            //     reqData.name = this.predictiveSearchId;
            // }
            if (this.selectedDate) {
                reqData.daterange_filter = this.selectedDate;
                url = url + `&daterange_filter=${this.selectedDate}`;

            }
            const res$ = this.apiService.getReq(API_PATH.LEAD_COMPANY_DOCUMENTS + url, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.getCompanyDocsList();
                this.totalDocs = response.data.total_records;
                this.documentLength =  response.data.total_records;

                this.leaddocumentsList = response.data.lead_documents;
               // this.companyDocuments = response.data.company_documents;
                this.predictiveSearchId = ''
                this.page < response.data.last_page ? this.hasMoreDocs = true : this.hasMoreDocs = false;
                // for (let i = 0; i < this.documentsList.length; i++) {
                //     if (this.documentsList[i].document_type != 'other') {
                //         this.docTypes = this.docTypes.filter(e => e.value != this.documentsList[i].document_type)
                //     }
                // }
            } else {
                this.documentsList = [];
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    async getCompanyDocsList() {
        try {
            this.commonService.showSpinner();
            let url = `?sort_by=${this.searchOrder.sortby}&dir=${this.searchOrder.order}&page_limit=${this.limit}&page=${this.page}&type=Company&document_type=${this.tabViewCompnay}`;
            //change dynamic tab to static &type=${this.companytabView}`
            let reqData: any = {
                page: this.page,
                records_per_page: this.limit,
                sort_by: this.searchOrder.sortby,
                dir: this.searchOrder.order
            }
            if (this.search && this.predictiveSearchId) {
                reqData.name = this.predictiveSearchId;
                url = url + `&name=${this.predictiveSearchId}`;
            }
            if (this.search && !this.predictiveSearchId) {
                reqData.name = this.search
                url = url + `&name=${this.search}`;
            }
            // if (this.search) {
            //     reqData.name = this.predictiveSearchId;
            // }
            if (this.selectedDate) {
                reqData.daterange_filter = this.selectedDate;
                url = url + `&daterange_filter=${this.selectedDate}`;

            }
            // const res$ = this.apiService.getReq(API_PATH.COMPANY_DOCUMENTS_LIST + url, 'lead', 'view');
            //Update API 
            const res$ = this.apiService.getReq(API_PATH.LEAD_COMPANY_DOCUMENTS + url, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.totalDocs = response.data.total_records;
                this.companyDocuments = response.data.company_documents;
                this.predictiveSearchId = ''
                this.page < response.data.last_page ? this.hasMoreDocs = true : this.hasMoreDocs = false;
                // for (let i = 0; i < this.documentsList.length; i++) {
                //     if (this.documentsList[i].document_type != 'other') {
                //         this.docTypes = this.docTypes.filter(e => e.value != this.documentsList[i].document_type)
                //     }
                // }
            } else {
                this.companyDocuments = [];
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    

    async getDocumentTypes() {
        try {
            const url = `?sort_by=slug&dir=ASC&page_limit=2000`
            const res$ = this.apiService.getReq(API_PATH.DOCUMENT_TYPES + url, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.docTypes = response.data;
                // this.actualdocTypes = response.data
            }
        } catch (error) {
            this.commonService.showErrorMessage(error);
        }
    }

    getDocType(val: string): string {
        let v = this.docTypes.find(e => e.value === val);
        // let v = this.actualdocTypes.find(e => e.value === val);
        if (v) {
            return v.text;
        }
        return '';
    }

  
    docsType(value: any, i: any) {
        // if(this.formFileArray.value[i].doc_type == 'other'){
        //     this.docTypes = this.docTypes.filter(e => e.text !== this.formFileArray.value[i].doc_type);
        // }

        if (this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_bank_statement' || this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_cc_statement') {
            this.initOwnerDob();
            // if (this.filesForm.get('files')['controls'][i].controls.document_date.value && !Constants.Custom_Regex.date.test(this.filesForm.get('files')['controls'][i].controls.document_date.value)) {
            //     this.commonService.showError('Invalid document date.');
            //     this.commonService.hideSpinner();
            //     return;
            // }
            for (let i = 0; i < this.formFileArray.length; i++) {
                // this.filesForm.get('files')['controls'][i].controls.document_date.setValidators(Validators.required);
                // this.filesForm.get('files')['controls'][i].controls.document_date.updateValueAndValidity();
                this.filesForm.get('files')['controls'][i].controls.doc_note.setValidators(Validators.pattern(Constants.Custom_Regex.spaces));
                this.filesForm.get('files')['controls'][i].controls.doc_note.updateValueAndValidity();

                this.filesForm.get('files')['controls'][i].controls.document_month.setValidators(Validators.required);
                this.filesForm.get('files')['controls'][i].controls.document_month.updateValueAndValidity();

                this.filesForm.get('files')['controls'][i].controls.document_year.setValidators(Validators.required);
                this.filesForm.get('files')['controls'][i].controls.document_year.updateValueAndValidity();
            }
        } else {
            this.filesForm.get('files')['controls'][i].controls.doc_name.setValidators([
                Validators.required,
                Validators.pattern(Constants.Custom_Regex.spaces),
                // Validators.minLength(3),
                Validators.maxLength(100),
                Validators.pattern(Constants.Custom_Regex.username),
                Validators.pattern(Constants.Custom_Regex.name)
            ]);
            this.filesForm.get('files')['controls'][i].controls.doc_name.updateValueAndValidity();
        }
    }
    documentDate() {
        this.initOwnerDob();
    }


    /**
     * @description remove file
     * @param i 
     */
    removeLocalFile(i: number) {
        this.selectedFiles.splice(i, 1);
    }
    sortBy(col: string) {
        if (!this.documentsList.length) {
            return;
        }
        if (this.searchOrder.sortby === col) {
            if (this.searchOrder.order === 'ASC') {
                this.searchOrder.order = 'DESC'
            } else {
                this.searchOrder.order = 'ASC'
            }
        } else {
            this.searchOrder.order = 'DESC';
            this.searchOrder.sortby = col;
        }
        this.getDocsList();
    }

    async uploadDocuments() {
        try {
            // let arr = [];
            for (let i = 0; i < this.formFileArray.length; i++) {
                // arr.push(this.filesForm.get('files')['controls'][i].controls.doc_type.value);
                // if (this.filesForm.get('files')['controls'][i].controls.document_date.value && !Constants.Custom_Regex.date.test(this.filesForm.get('files')['controls'][i].controls.document_date.value)) {
                //     this.commonService.showError('Invalid document date.');
                //     this.uploading = false;
                //     this.commonService.hideSpinner();
                //     return;
                // }

                if (this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_bank_statement' || this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_cc_statement') {
                    this.filesForm.get('files')['controls'][i].controls.document_month.setValidators(Validators.required);
                    this.filesForm.get('files')['controls'][i].controls.document_month.updateValueAndValidity();
                    this.filesForm.get('files')['controls'][i].controls.document_month.markAsTouched();
                    this.filesForm.get('files')['controls'][i].controls.document_year.setValidators(Validators.required);
                    this.filesForm.get('files')['controls'][i].controls.document_year.updateValueAndValidity();
                    this.filesForm.get('files')['controls'][i].controls.document_year.markAsTouched();
                    this.filesForm.get('files')['controls'][i].controls.doc_note.setValidators(Validators.pattern(Constants.Custom_Regex.spaces));
                    this.filesForm.get('files')['controls'][i].controls.doc_note.updateValueAndValidity();
                    this.filesForm.get('files')['controls'][i].controls.doc_note.markAsTouched();
                    // this.filesForm.get('files')['controls'][i].controls.document_date.setValidators(Validators.required);
                    // this.filesForm.get('files')['controls'][i].controls.document_date.updateValueAndValidity();
                    // this.filesForm.get('files')['controls'][i].controls.document_date.markAsTouched();

                } else {
                    this.filesForm.get('files')['controls'][i].controls.document_month.clearValidators();
                    this.filesForm.get('files')['controls'][i].controls.document_month.updateValueAndValidity();
                    this.filesForm.get('files')['controls'][i].controls.document_year.clearValidators();
                    this.filesForm.get('files')['controls'][i].controls.document_year.updateValueAndValidity();
                    // this.filesForm.get('files')['controls'][i].controls.document_date.clearValidators();
                    // this.filesForm.get('files')['controls'][i].controls.document_date.updateValueAndValidity();
                    this.filesForm.get('files')['controls'][i].controls.doc_note.clearValidators();
                    this.filesForm.get('files')['controls'][i].controls.doc_note.updateValueAndValidity();
                }

            }

            for (let i = 0; i < this.formFileArray.length; i++) {
                if (this.filesForm.get('files')['controls'][i].controls.doc_type.value != '3month_bank_statement' && this.filesForm.get('files')['controls'][i].controls.doc_type.value != '3month_cc_statement') {
                    this.filesForm.get('files')['controls'][i].controls.doc_name.setValidators([Validators.required, Validators.pattern(Constants.Custom_Regex.spaces),
                    // Validators.minLength(3),
                    Validators.maxLength(100),
                    Validators.pattern(Constants.Custom_Regex.username),
                    Validators.pattern(Constants.Custom_Regex.name)
                    ]);
                    this.filesForm.get('files')['controls'][i].controls.doc_name.updateValueAndValidity();
                    this.filesForm.get('files')['controls'][i].controls.doc_name.markAsTouched();
                } else {
                    this.filesForm.get('files')['controls'][i].controls.doc_name.clearValidators();
                    this.filesForm.get('files')['controls'][i].controls.doc_name.updateValueAndValidity();
                }

            }
            this.filesForm.markAllAsTouched();

            // for (let i = 0; i < arr.length; i++) {
            //     if (arr[i] != 'other') {
            //         if (arr.indexOf(arr[i]) !== arr.lastIndexOf(arr[i])) {
            //             this.commonService.showError('Duplicate document types are not allowed');
            //             this.uploading = false;
            //             this.commonService.hideSpinner();
            //             return;
            //         }
            //     }

            // }
            this.uploading = true;
            let lead_id = '';
            if (this.formFileArray.length) {
                if (this.roles.ADMINISTRATOR === this.userRole) {
                    // !this.company || 
                    if (!this.user || !this.leadOfCompany) {
                        // this.commonService.showError('Please select company and lead first.')
                        this.commonService.showError('Please select user and lead first.')
                        this.uploading = false;
                        return;
                    }
                    lead_id = this.leadOfCompany;
                } else {
                    if (!this.leadId) {
                        this.uploading = false;
                        this.commonService.showError('Please select lead first.')
                        return;
                    }
                    lead_id = this.leadId
                }
                if (this.formFileArray.valid) {
                    const formData: FormData = new FormData();
                    for (let i = 0; i < this.formFileArray.value.length; i++) {
                        if (this.getMonthsCheck(this.formFileArray.value[i].document_month) > this.documentDateCheck.getMonth() &&
                            this.formFileArray.value[i].document_year >= this.documentDateCheck.getFullYear()) {
                            this.uploading = false;
                            return this.commonService.showError('Please select a past date')

                        }
                        formData.append('document[]', this.formFileArray.value[i].file, this.formFileArray.value[i].fileName);
                        if (this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_bank_statement' || this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_cc_statement') {
                            // formData.append('name[]', this.formFileArray.value[i].document_date);
                            formData.append('name[]', this.formFileArray.value[i].document_month);
                            formData.append('document_year[]', this.formFileArray.value[i].document_year);
                            formData.append('note[]', this.formFileArray.value[i].doc_note);
                        } else {
                            formData.append('name[]', this.formFileArray.value[i].doc_name);
                        }

                        formData.append('document_type[]', this.formFileArray.value[i].doc_type);
                    }
                    formData.append('lead_id', lead_id);

                    // this.uploading = true;
                    this.ngxLoader.startLoader('r1');
                    const res$ = this.apiService.postReq(API_PATH.UPLOAD_LEAD_DOC, formData, 'lead', 'edit');
                    const response = await lastValueFrom(res$);
                    if (response && response.status_code == "200") {
                        this.commonService.showSuccess(response.message);
                        // for (let i = 0; i < this.formFileArray.value.length; i++) {
                        //     if (this.formFileArray.value[i].doc_type != 'other') {
                        //         this.docTypes = this.docTypes.filter(e => e.value != this.formFileArray.value[i].doc_type);
                        //     }
                        // }
                        this.uploading = false;
                        this.ngxLoader.stopLoader('r1');
                        this.selectedFiles = [];
                        this.search = '';
                        this.page = 1;
                        this.getDocsList();
                        this.formFileArray.clear();
                    } else {
                        this.uploading = false;
                        this.commonService.showError(response.message);
                        this.ngxLoader.stopLoader('r1');

                    }
                } else {
                    this.formFileArray.markAllAsTouched();
                    this.uploading = false;
                }

            } else {
                this.commonService.showError('No file selected.')
                this.uploading = false;
            }
        } catch (error) {
            this.uploading = false;
            this.commonService.hideSpinnerWithId('uploading');
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
            this.ngxLoader.stopLoader('r1');

        }
    }

    async uploadCompanyDocuments() {
        try {
            // let arr = [];
            for (let i = 0; i < this.formFileArray.length; i++) {
                // arr.push(this.filesForm.get('files')['controls'][i].controls.doc_type.value);
                // if (this.filesForm.get('files')['controls'][i].controls.document_date.value && !Constants.Custom_Regex.date.test(this.filesForm.get('files')['controls'][i].controls.document_date.value)) {
                //     this.commonService.showError('Invalid document date.');
                //     this.uploading = false;
                //     this.commonService.hideSpinner();
                //     return;
                // }

                if (this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_bank_statement' || this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_cc_statement') {
                    this.filesForm.get('files')['controls'][i].controls.document_month.setValidators(Validators.required);
                    this.filesForm.get('files')['controls'][i].controls.document_month.updateValueAndValidity();
                    this.filesForm.get('files')['controls'][i].controls.document_month.markAsTouched();
                    this.filesForm.get('files')['controls'][i].controls.document_year.setValidators(Validators.required);
                    this.filesForm.get('files')['controls'][i].controls.document_year.updateValueAndValidity();
                    this.filesForm.get('files')['controls'][i].controls.document_year.markAsTouched();
                    this.filesForm.get('files')['controls'][i].controls.doc_note.setValidators(Validators.pattern(Constants.Custom_Regex.spaces));
                    this.filesForm.get('files')['controls'][i].controls.doc_note.updateValueAndValidity();
                    this.filesForm.get('files')['controls'][i].controls.doc_note.markAsTouched();
                    // this.filesForm.get('files')['controls'][i].controls.document_date.setValidators(Validators.required);
                    // this.filesForm.get('files')['controls'][i].controls.document_date.updateValueAndValidity();
                    // this.filesForm.get('files')['controls'][i].controls.document_date.markAsTouched();

                } else {
                    this.filesForm.get('files')['controls'][i].controls.document_month.clearValidators();
                    this.filesForm.get('files')['controls'][i].controls.document_month.updateValueAndValidity();
                    this.filesForm.get('files')['controls'][i].controls.document_year.clearValidators();
                    this.filesForm.get('files')['controls'][i].controls.document_year.updateValueAndValidity();
                    // this.filesForm.get('files')['controls'][i].controls.document_date.clearValidators();
                    // this.filesForm.get('files')['controls'][i].controls.document_date.updateValueAndValidity();
                    this.filesForm.get('files')['controls'][i].controls.doc_note.clearValidators();
                    this.filesForm.get('files')['controls'][i].controls.doc_note.updateValueAndValidity();
                }

            }

            for (let i = 0; i < this.formFileArray.length; i++) {
                if (this.filesForm.get('files')['controls'][i].controls.doc_type.value != '3month_bank_statement' && this.filesForm.get('files')['controls'][i].controls.doc_type.value != '3month_cc_statement') {
                    this.filesForm.get('files')['controls'][i].controls.doc_name.setValidators([Validators.required, Validators.pattern(Constants.Custom_Regex.spaces),
                    // Validators.minLength(3),
                    Validators.maxLength(100),
                    Validators.pattern(Constants.Custom_Regex.username),
                    Validators.pattern(Constants.Custom_Regex.name)
                    ]);
                    this.filesForm.get('files')['controls'][i].controls.doc_name.updateValueAndValidity();
                    this.filesForm.get('files')['controls'][i].controls.doc_name.markAsTouched();
                } else {
                    this.filesForm.get('files')['controls'][i].controls.doc_name.clearValidators();
                    this.filesForm.get('files')['controls'][i].controls.doc_name.updateValueAndValidity();
                }

            }
            this.filesForm.markAllAsTouched();

            // for (let i = 0; i < arr.length; i++) {
            //     if (arr[i] != 'other') {
            //         if (arr.indexOf(arr[i]) !== arr.lastIndexOf(arr[i])) {
            //             this.commonService.showError('Duplicate document types are not allowed');
            //             this.uploading = false;
            //             this.commonService.hideSpinner();
            //             return;
            //         }
            //     }

            // }
            this.uploading = true;
            let lead_id = '';
            if (this.formFileArray.length) {
                // if (this.roles.ADMINISTRATOR === this.userRole) {
                //     // !this.company || 
                //     if (!this.user || !this.leadOfCompany) {
                //         // this.commonService.showError('Please select company and lead first.')
                //         this.commonService.showError('Please select user and lead first.')
                //         this.uploading = false;
                //         return;
                //     }
                //     lead_id = this.leadOfCompany;
                // } else {
                //     if (!this.leadId) {
                //         this.uploading = false;
                //         this.commonService.showError('Please select lead first.')
                //         return;
                //     }
                //     lead_id = this.leadId
                // }
                if (this.formFileArray.valid) {
                    const formData: FormData = new FormData();
                    for (let i = 0; i < this.formFileArray.value.length; i++) {
                        if (this.getMonthsCheck(this.formFileArray.value[i].document_month) > this.documentDateCheck.getMonth() &&
                            this.formFileArray.value[i].document_year >= this.documentDateCheck.getFullYear()) {
                            this.uploading = false;
                            return this.commonService.showError('Please select a past date')

                        }
                        formData.append('document[]', this.formFileArray.value[i].file, this.formFileArray.value[i].fileName);
                        if (this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_bank_statement' || this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_cc_statement') {
                            // formData.append('name[]', this.formFileArray.value[i].document_date);
                            formData.append('name[]', this.formFileArray.value[i].document_month);
                            formData.append('document_year[]', this.formFileArray.value[i].document_year);
                            formData.append('note[]', this.formFileArray.value[i].doc_note);
                        } else {
                            formData.append('name[]', this.formFileArray.value[i].doc_name);
                        }

                        formData.append('document_type[]', this.formFileArray.value[i].doc_type);
                    }
                   // formData.append('lead_id', lead_id);

                    // this.uploading = true;
                    this.ngxLoader.startLoader('r1');
                    const res$ = this.apiService.postReq(API_PATH.COMPANY_DOCUMENTS_UPLOAD, formData, 'lead', 'edit');
                    const response = await lastValueFrom(res$);
                    if (response && response.status_code == "200") {
                        this.commonService.showSuccess(response.message);
                        // for (let i = 0; i < this.formFileArray.value.length; i++) {
                        //     if (this.formFileArray.value[i].doc_type != 'other') {
                        //         this.docTypes = this.docTypes.filter(e => e.value != this.formFileArray.value[i].doc_type);
                        //     }
                        // }
                        this.uploading = false;
                        this.ngxLoader.stopLoader('r1');
                        this.selectedFiles = [];
                        this.search = '';
                        this.page = 1;
                        this.getCompanyDocsList();
                        this.formFileArray.clear();
                    } else {
                        this.uploading = false;
                        this.commonService.showError(response.message);
                        this.ngxLoader.stopLoader('r1');

                    }
                } else {
                    this.formFileArray.markAllAsTouched();
                    this.uploading = false;
                }

            } else {
                this.commonService.showError('No file selected.')
                this.uploading = false;
            }
        } catch (error) {
            this.uploading = false;
            this.commonService.hideSpinnerWithId('uploading');
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
            this.ngxLoader.stopLoader('r1');

        }
    }
    uploadDocumentType(){
        if(this.tabView == 'Lead'){
            this.uploadDocuments();
        }else{
            this.uploadCompanyDocuments();
        }
    }

    /**
     * 
     */

    initOwnerDob() {
        if (this.ownerDob) {
            Inputmask('datetime', {
                inputFormat: 'mm-dd-yyyy',
                placeholder: 'mm-dd-yyyy',
                alias: 'datetime',
                min: '01-01-1920',
                max: this.nowDate,
                clearMaskOnLostFocus: false,
            }).mask(this.ownerDob.nativeElement);
        }
    }
    async getCompaniesList() {
        try {
            let url = `?page_limit=15&page=${this.companyListPage}&role=${Roles.COMPANY}&status=Active`;
            if (this.companySearch) {
                url = url + `&search_keyword=${this.companySearch}`
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.ADMIN_LISTS + url, 'company', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreCompanies = response.data.hasMorePages;
                if (this.companyListPage == 1) {
                    this.companiesList = response.data.data;
                } else {
                    this.companiesList = [...this.companiesList, ...response.data.data];
                }

            } else {
                this.companiesList = [];
                this.companyLeads = [];
                this.leadOfCompany = null;
                this.company = null;
                this.hasMoreCompanies = false;
                this.companyListPage = 1;
            }
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    async getUsersList() {
        try {
            let url = `?page_limit=15&page=${this.userListPage}&status=Active`;
            if (this.usersSearch) {
                url = url + `&search_keyword=${this.usersSearch}`
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.USERS_LIST + url, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                if (this.userListPage == 1) {
                    this.usersList = response.data.data;
                } else {
                    this.usersList = [...this.usersList, ...response.data.data];
                }

            } else {
                this.usersList = [];
                this.companyLeads = [];
                this.leadOfCompany = null;
                this.user = null;
                this.hasMoreUsers = false;
                this.userListPage = 1;
            }
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    async getCompanyBasedLeads() {
        try {
            this.commonService.showSpinner();
            // { company_id: this.company }
            const res$ = this.apiService.postReq(API_PATH.COMPANY_LEADS, { user_id: this.user }, 'lead', 'list');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.companyLeads = response.data;
            } else {
                this.companyLeads = [];
            }
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    /**
     * @description search company
     * @param value 
     */
    onCompanySearch(value: { term: string, items: any[] }) {
        if (value.term) {
            this.companySearch = value.term
        } else {
            this.companySearch = '';
        }
        this.companyListPage = 1;
        this.getCompaniesList();
    }

    async onCompanySelect(value: any) {
        this.companyLeads = [];
        this.leadOfCompany = null;
        this.getCompanyBasedLeads();
    }

    /**
     * @description implement pagination
     */
    getMoreCompanies() {
        if (this.hasMoreCompanies) {
            this.companyListPage++;
            this.getCompaniesList();
        }
    }


    /**
  * @description search company
  * @param value 
  */
    onUserSearch(value: { term: string, items: any[] }) {
        if (value.term) {
            this.usersSearch = value.term
        } else {
            this.usersSearch = '';
        }
        this.userListPage = 1;
        this.getUsersList();
    }

    async onUserSelect(value: any) {
        this.companyLeads = [];
        this.leadOfCompany = null;
        this.getCompanyBasedLeads();
    }

    /**
     * @description implement pagination
     */
    getMoreUsers() {
        if (this.hasMoreUsers) {
            this.userListPage++;
            this.getUsersList();
        }
    }



    /**
     * 
     * @param files 
     */
    onFileChange(files: File[], input: any) {
        this.selectedFiles = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].size / 1024 / 1024 > 30) {
                this.commonService.showError('Maximum file size allowed is 30MB');
            } else if (!SETTINGS.ALLOWED_FILES.includes(files[i].type)) {
                this.commonService.showError('Invalid file type. Allowed file type are - gif|jpeg|png|txt|doc|docx|xlsx|xls|pdf|wav|mp3 ');
            } else {
                this.addFileToForm(files[i])
            }
        }
        input.value = '';
    }

    /**
    * @description on limit change
    * @param value 
    * @returns {void}
    * @author Shine Dezign Infonet Pvt. Ltd.
    */
    onLimitChange(value: number): void {
        this.limit = value;
        this.page = 1;
        this.getDocsList();
    }

    /**
  * @description on page change
  * @returns {void}
  * @param p 
  */
    onPageChange(p: number): void {
        this.page = p;
        this.getDocsList();
    }

    resetFilter() {
        this.search = '';
        this.page = 1;
        this.selectedDate = '';
        this.fromDate = null;
        this.toDate = null;
        this.getDocsList();
    }


    /**
     * @description delete document
     * @param docId 
     */
    async deleteDoc(docId: string, delete_type: any) {
        if (delete_type == 'lead') {
            this.deleteleadDocument(docId)
        } else if (delete_type == 'syndicate') {
            this.deletesyndicateDocument(docId)
        } else {
            this.deleteisoDocument(docId)
        }

    }
    deleteCompanyDoc(docId: string, delete_type: any) {
        this.deletecompanyDocument(docId,delete_type);
        // if (delete_type == 'lead') {
        //     this.deleteleadDocument(docId)
        // } else if (delete_type == 'syndicate') {
        //     this.deletesyndicateDocument(docId)
        // } else {
        //     this.deleteisoDocument(docId)
        // }

    }
    async deleteleadDocument(docId: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DELETE_LEAD_DOC, { document_id: docId }, 'lead', 'edit');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                // let data = this.documentsList.filter((e) => e.document_id == docId);
                // if (data[0].document_type != 'other') {
                //     let data2 = this.actualdocTypes.filter((e) => e.value == data[0].document_type);
                //     this.docTypes.push(data2[0])
                // }
                this.documentsList = this.documentsList.filter(e => e.document_id !== docId);
                this.totalDocs = this.totalDocs - 1;
                this.getDocsList()

            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    async deletecompanyDocument(docId: string,deletType:string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.COMPANY_DOCUMENTS_DELETE, { document_id: docId,document_type:deletType}, 'lead', 'edit');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                // let data = this.documentsList.filter((e) => e.document_id == docId);
                // if (data[0].document_type != 'other') {
                //     let data2 = this.actualdocTypes.filter((e) => e.value == data[0].document_type);
                //     this.docTypes.push(data2[0])
                // }
                this.companyDocuments = this.companyDocuments.filter(e => e.document_id !== docId);
                this.totalDocs = this.totalDocs - 1;
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    async deletesyndicateDocument(id: any): Promise<void> {
        let reqData: any = {
            document_id: id
        }
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.SYNDICATE_DOCUMENT_DELETE, reqData, 'lead', 'edit');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.getDocsList()
                this.commonService.showSuccess(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
            // }
        }

    }

    async deleteisoDocument(id: any): Promise<void> {
        let reqData: any = {
            document_id: id
        }
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_SOURCE_DOCUMENT_DELETE, reqData, 'lead', 'edit');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.getDocsList();
                this.commonService.showSuccess(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
            // }
        }

    }

    isHovered(date: NgbDate) {
        return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
    }

    isInside(date: NgbDate) {
        return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
    }

    isRange(date: NgbDate) {
        return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
    }

    validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
        const parsed = this.formatter.parse(input);
        return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
    }

    onDateSelection(date: NgbDate) {
        if (!this.fromDate && !this.toDate) {
            this.fromDate = date;
        } else if (this.fromDate && !this.toDate && date && (date.equals(this.fromDate) || date.after(this.fromDate))) {
            this.toDate = date;
            this.datepicker.toggle();
        } else {
            this.toDate = null;
            this.fromDate = date;
        }
        let sDate = '';
        if (this.fromDate) {
            sDate = this.formatter.format(this.fromDate);
            if (this.toDate) {
                sDate = sDate + ' / ' + this.formatter.format(this.toDate);
                this.selectedDate = sDate;
                this.page = 1;
                this.getDocsList();
            }
        }
    }

    /**
     * @description open modal
     * @param modal 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    openModal(modal: TemplateRef<any>, doc: any) {
        this.documentDetails = {
            name: doc.document_name,
            id: doc.document_id,
            document_type: doc.delete_type
        }
        let options: any = {
            backdrop: 'static',
        }
        this.modal = this.modalService.open(modal, options)
    }

    /**
     * 
     * @param value 
     */
    onModelClose(value: any) {
        if (value && value.name) {
            const i = this.documentsList.findIndex((e) => e.document_id === this.documentDetails.id);
            if (i > -1) {
                this.documentsList[i].document_name = value.name;
            }
        }
        this.closeModal();
    }

    /**
     * @description close modal
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    closeModal() {
        this.modal.close();
    }

    async downloadFile(doc: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DOWNLOAD_FILE, { file: doc.actual_name }, 'lead', 'list', 'arraybuffer');
            const response = await lastValueFrom(res$);
            const arrayBufferView = new Uint8Array(response);
            const file = new Blob([arrayBufferView], { type: doc.document_type });
            let url = window.URL.createObjectURL(file);
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
            // a.download = doc.actual_name;
            if(this.companyType == 'funded'){
                a.download = doc.actual_name;
            }else{
                a.download = doc.download_path;
            }
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error)
        }
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    // pagination 
    ngDoCheck() {
        // this.getUserDetails();
        // this.getColorOnUpdate();

        this.getPaginationLIst();
        this.getDateColor();
    }
    // custom datepicker color


    getDateColor() {
        let monthNameClr = document.getElementsByClassName('ngb-dp-month-name');
        // let data3 = document.getElementsByClassName('btn btn-link ngb-dp-arrow-btn');
        let arrowColor = document.getElementsByClassName('ngb-dp-navigation-chevron');
        for (let i = 0; i < monthNameClr.length; i++) {
            monthNameClr[i].setAttribute('style', `color:${this.color}`)
            arrowColor[i].setAttribute('style', `border-color:${this.color}`)
        }
        let weekNameClr = document.getElementsByClassName('ngb-dp-weekday small');
        for (let i = 0; i < weekNameClr.length; i++) {
            weekNameClr[i].setAttribute('style', `color:${this.color}`)
        }



        const tds = document.getElementsByClassName('custom-day') as HTMLCollectionOf<HTMLElement>;
        for (let index = 0; index < tds.length; index++) {
            tds[index].style.setProperty('--custom', `${this.color}`);

        }
    }
    getPaginationLIst() {

        let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
        for (let i = 0; i < data?.length; i++) {
            if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                data[i].style.background = this.color;
            } else {
                data[i].style.background = 'none';

            }
            // data[i]
        }

    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
    documentYear() {
        for (let i = 0; i < 20; i++) {
            this.range.push(this.startYear - i);
        }
    }

    getMonthsCheck(input: any) {
        let inputMap: any = {
            "January": 0,
            "February": 1,
            "March": 2,
            "April": 3,
            "May": 4,
            "June": 5,
            "July": 6,
            "August": 7,
            "September": 8,
            "October": 9,
            "November": 10,
            "December": 11
        };
        let defaultValue = 'not-exist'
        return inputMap[input] || defaultValue;
    }
    getCompanyDocuments(tabType: any) {
        this.tabView = 'Company';
        // this.companytabView = tabType
        this.tabViewCompnay = tabType
        this.search = '';
        this.fromDate = null;
        this.toDate = null;
        this.selectedDate = '';
        this.getCompanyDocsList();
    }
    getLeadDocuments() {
        this.tabView = 'Lead';
        this.search = '';
        this.fromDate = null;
        this.toDate = null;
        this.selectedDate = '';
        this.getDocsList()
    }

}
