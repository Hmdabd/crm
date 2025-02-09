import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import * as Constants from '@constants/constants';
import { Roles } from '@constants/constants';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { ExcelService } from '@services/excel.service';
import { settings } from 'cluster';
import moment from 'moment';
import { debounceTime, distinctUntilChanged, filter, fromEvent, lastValueFrom, Subscription, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx'

@Component({
    selector: 'app-leads-list',
    templateUrl: './leads-list.component.html',
    styleUrls: ['../../../styles/dashboard.scss', '../../../styles/predictive-search.scss', './leads-list.component.scss']
})
export class LeadsListComponent implements OnInit, AfterViewInit, OnDestroy {

    routeSubscription!: Subscription;
    canViewLead: boolean = false;
    roles = Constants.Roles;
    userRole: string = '';
    dashboardData: any = {};
    advanceSearchToggle: boolean = false;
    recordsPerPage: number = 10;
    leadsList: Array<any> = [];
    totalRecords: number = 0;
    page: number = 1;
    searchKeyword: string = '';
    //daterangepicker
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: any = '';
    maxDate!: NgbDateStruct;
    campaignList: Array<any> = [];
    leadStatusList: Array<any> = [];
    leadSourceList: Array<any> = [];
    managersList: Array<any> = [];
    usersList: Array<any> = [];
    leadIdArray: Array<any> = [];
    predictiveSearchResults: Array<any> = [];
    @ViewChild('datepicker') datepicker: any;
    @ViewChild('selectAll') selectAll!: ElementRef;

    hasMoreUsers: boolean = false;
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    companiesList: Array<any> = [];
    userListPage: number = 1;
    status: any = '';
    timeZone: string = '';
    predictiveSearchId: string = '';
    importForm !: FormGroup;
    @ViewChild('fileUplod') fileUplod!: ElementRef;
    leadCreateFromJson: boolean = true;
    actualFundRecordsArray: Array<any> = [];

    tempFilter: { [key: string]: any } = {
        "Search": { value: "" },
        "Date": { value: "" },
        "Status": { value: null },
        "Full name": { value: "" },
        "First name": { value: "" },
        "Last name": { value: "" },
        "Phone": { value: "" },
        "Email": { value: "" },
        "Exclusive lead": { value: null },
        "ID": { value: "" },
        "Company name": { value: "" },
        "Disposition": { value: null },
        // "Manager": { value: null },
        "All Users": { value: null },
        "Team": { value: null },
        "ISO": { value: null },
        "Lead Source": { value: null },
        "Compaign": { value: null },
        "Company": { value: null },
        "Lead status": { value: null },
        "Submitter": { value: null }
    }

    appliedFilter: { [key: string]: any } = {
    }

    canAddLead: boolean = false;
    canDeleteLead: boolean = false;
    canEditLead: boolean = false;
    canExportLead: boolean = false;
    canCreateLead: boolean = false;
    submittersList: Array<any> = [];
    dateFormat: string = "";
    dispositionOptions = [
        { id: 1, name: 'Sale' },
        { id: '', name: 'No Sale' }
    ]
    @ViewChild('predictiveSearch', { static: true }) predictiveSearch!: ElementRef;
    colorSubs!: Subscription;
    style!: { fill: string; };
    background!: { background: string; };
    color!: string;
    boo: boolean = false;
    canListLead: boolean = false;
    canDuplicateLead: boolean = false;
    modal!: NgbModalRef;
    search = {
        order: 'DESC',
        sortby: 'created_at'
    }
    leadImportArray: Array<any> = [];
    canImportLead: boolean = false;
    totalchunkDataSubmit: number = 0;
    userDetails: any = {};
    loading = false;
    @Input() showProgress: boolean = false;
    showWaitTime: boolean = false
    getAllUserList:any = []
    getTeamList:any = []
    canViewTeamList:boolean = false;
    getLeadIDLS:string | null = '';
    lsLeadId:string = '';

    constructor(
        private authService: AuthService,
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
        private router: Router,
        private route: ActivatedRoute,
        private excelService: ExcelService,
        private modalService: NgbModal,
        private fb: FormBuilder

    ) { }


    ngOnInit(): void {
        this.getUserDetails();
        if (this.showProgress == false && this.userDetails.company_type == 'funded') {
            this.showWaitTime = true
        } else {
            this.showWaitTime = false
        }
        this.canViewLead = this.authService.hasPermission('lead-view');
        this.canAddLead = this.authService.hasPermission('lead-create');
        this.canDeleteLead = this.authService.hasPermission('lead-delete');
        this.canEditLead = this.authService.hasPermission('lead-edit');
        this.canExportLead = this.authService.hasPermission('lead-export');
        this.canImportLead = this.authService.hasPermission('lead-import');
        this.canCreateLead = this.authService.hasPermission('lead-create');
        this.canListLead = this.authService.hasPermission('lead-list');
        this.canDuplicateLead = this.authService.hasPermission('lead-duplicate');
        this.canViewTeamList = this.authService.hasPermission('team-list');

        this.getSubmittersList();

        this.routeSubscription = this.route.queryParams
            .subscribe(params => {
                this.tempFilter['Search'].value = params['search'];
                this.predictiveSearchId = params['searchId'];
                // this.tempFilter['Lead status'].value = params['leadStatus'].split();
                //     console.log("gujgy", this.tempFilter['Lead status'].value)
                // if (this.tempFilter['Search'].value || this.tempFilter['Lead status'].value) {
                //     if (this.tempFilter['Lead status'].value == 'activeLead' ){
                //         this.tempFilter['Lead status'].value = null
                //     }
                if (params['leadStatus']) {
                    this.tempFilter['Status'].value = params['leadStatus'].split();
                }
                if (this.tempFilter['Search'].value || this.tempFilter['Status'].value) {
                    if (this.tempFilter['Status'].value == 'activeLead') {
                        this.tempFilter['Status'].value = null
                    }
                    this.onSearch();
                } else {
                    this.onSearch();
                }

            });


        this.maxDate = this.calendar.getToday();
        this.getLeadOptions();
        
      

        //4th oct 2023
        this.getLeadIDLS = localStorage.getItem(Constants.SETTINGS.LEAD_ID);
        if(this.getLeadIDLS){
          let lD =  this.authService.decrypt(this.getLeadIDLS);
          this.lsLeadId = JSON.parse(lD); 
          if( this.lsLeadId){
            this.onLeadAccessCheck();
        }

        }
        // != null && this.getLeadIDLS != undefined
       

// end
        this.getListings();
        this.initImportForm();
       

        // this.getPaginationLIst();

        // this.get50PerColor();
        this.getAllUser();
        this.getTeamlist();
        

    }

    //officer info

    /**
     * @description init officer form
     */
    initImportForm() {
        this.importForm = this.fb.group({
            company_id: [null],


        })
    }

    /**
     * @description get lead detail form controls
     */
    get f(): { [key: string]: AbstractControl } {
        return this.importForm.controls;
    }

    ngDoCheck() {
        // this.getUserDetails();
        // this.getColorOnUpdate();

        this.getPaginationLIst();
        this.getDateColor();
    }

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
        //blink
        const tdData = document.getElementsByClassName('blink') as HTMLCollectionOf<HTMLElement>;
        for (let index = 0; index < tdData.length; index++) {
            tdData[index].style.setProperty('--dynamic', `${this.get50PerColor()}`);

        }

    }

    // //   document.getElementsByClassName('current')[0]?.setAttribute('style',`background-color:${this.color}`)
    //   document.getElementsByClassName('current')[0]?.setAttribute('style',`background-color:${this.color} `)
    //   console.log(data);


    // ngAfterViewChecked() {
    //     let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
    //     console.log(data);

    //     for(let i =0;i<data?.length;i++){
    //        if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted'){
    //         data[i].style.background=this.color.length?this.color:'#FA5440';
    //        } else {
    //         data[i].style.background='none';

    //        }
    //         // data[i]
    //     }
    //   }
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



    async getSubmittersList() {
        try {
            // , company_id: this.leadDetailsForm.value.company_id
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + `?role=${Constants.Roles.SUBMITTER}`, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.submittersList = response.data;
            } else {
                this.submittersList = [];
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

    /**
     * @description export leads as excel file,(export all leads if not selected particular lead)
     */
    async exportLeadasExcel() {
        try {
            if (!this.leadIdArray.length) {
                this.commonService.showError("Please select any lead");
                return
            }
            let selectedLeads = '';
            if (this.leadIdArray.length) {
                selectedLeads = this.leadIdArray.join();
            }
            const res = await this.getLeadsDataForExport(selectedLeads);
            if (res.length) {
                this.excelService.exportAsExcelFile(res, 'Leads');
            } else {
                this.commonService.showError("No data found");
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }



    ngAfterViewInit() {
        let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
        for (let i = 0; i < data?.length; i++) {
            if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                data[i].style.background = this.color.length ? this.color : '#FA5440';
            } else {
                data[i].style.background = 'none';

            }
        }
        fromEvent(this.predictiveSearch.nativeElement, 'keyup').pipe(
            tap(() => {
                if (!this.predictiveSearch.nativeElement.value) {
                    this.predictiveSearchResults = [];
                }
            }),
            filter(() => this.predictiveSearch.nativeElement.value && this.predictiveSearch.nativeElement.value.length > 0),
            debounceTime(200),
            distinctUntilChanged(),
            switchMap(() => this.apiService.postReq(API_PATH.PREDICTIVE_SEARCH, { search: this.predictiveSearch.nativeElement.value, records_per_search: 500, type: 'lead' }, 'lead', 'list'))
        ).subscribe((res) => {
            if (res && res.status_code == "200") {
                this.predictiveSearchResults = res.data;
            } else {
                this.predictiveSearchResults = [];
            }
        })
    }

    async getLeadsDataForExport(url: string) {
        try {
            // let leads = '';
            // if (url) {
            //     leads = `?export_lead=[${url}]`;
            // }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.EXPORT_LEAD, { export_lead: this.leadIdArray }, 'lead', 'list');
            const response = await lastValueFrom(res$);
            this.commonService.hideSpinner();
            let modifiedRes = [];
            for (let i = 0; i < response.data.length; i++) {
                modifiedRes.push({
                    ...response.data[i],
                    'Created': this.getDate(response.data[i]['Created'])
                })
            }

            if (response && response.status_code == "200") {
                return Promise.resolve(modifiedRes);
                // return Promise.resolve(response.data);
            } else {
                return Promise.resolve([]);
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }


    leadDetailRoute(id: string) {
        switch (this.userRole) {
            case Roles.ADMINISTRATOR:
                this.router.navigate([`/admin/lead-detail/${id}`]);
                break;
            case Roles.COMPANY:
                this.router.navigate([`/company/lead-detail/${id}`])
                break;
            case Roles.SUBMITTER:
                this.router.navigate([`/${this.userBaseRoute}/lead-detail/${id}`])
                break;
            default:
                break;
        }
    }

    get userBaseRoute() {
        return this.authService.getUserRole()?.toLowerCase();
    }

    /**
     * @description get user details from localstrorage
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userDetails = ud;
                this.userRole = ud.role;
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                switch (this.userRole) {
                    case Roles.ADMINISTRATOR:
                        this.getCompaniesList();
                        break;
                    default:
                        break;
                }
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                this.color = ud?.color;
                // this.stroke={stroke:ud?.color};
                this.background = { background: ud?.color };
                

            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    openImportModal() {
        this.openModel(this.fileUplod);
        if (this.userRole == Roles.ADMINISTRATOR) {
            this.getCompaniesList();
        }
    }
    getListings() {
        switch (this.userRole) {
            case Roles.ADMINISTRATOR:
                this.getCompaniesList();
                this.getManagersList();
                this.getUsersList();
                break;
            case Roles.COMPANY:
                this.getManagersList();
                this.getUsersList();
                break;
            case Roles.SUBMITTER:
                this.getManagersList();
                this.getUsersList();
                break;
            default:
                break;
        }
    }

    getDate(date: any) {
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm A`)
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }

    async getCompaniesList() {
        try {
            let url = `?page_limit=${this.usersListLimit}&page=${this.userListPage}&role=${Constants.Roles.COMPANY}&status=Active`;
            if (this.searchKeyword) {
                url = url + `&search_keyword=${this.searchKeyword}`
            }
            const res$ = this.apiService.getReq(API_PATH.ADMIN_LISTS + url, 'company', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                this.totalUsersCount = response.data.total;
                response.data.data = response.data.data.map((e: any) => ({ ...e, name: e.first_name + ' ' + e.last_name }))
                if (this.userListPage === 1) {
                    this.companiesList = response.data.data;
                } else {
                    this.companiesList = [...this.companiesList, ...response.data.data];
                }

            } else {
                this.companiesList = [];
                this.hasMoreUsers = false;
                this.userListPage = 1;
            }
        } catch (error: any) {
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }

    /**
     * @description remve filter
     * @param key 
     */
    removeFilter(key: string) {
        if (key === 'Date') {
            this.selectedDate = '';
            this.toDate = null;
            this.fromDate = null;
        }
        this.tempFilter[key].value = null;
        this.status = '';
        this.predictiveSearchId = '';
        this.onSearch();
    }

    /**
     * @description on Search click
     */
    onSearch() {
        this.page = 1;
        this.appliedFilter = JSON.parse(JSON.stringify(this.tempFilter));
        this.getLeadsList();
    }

    /**
     * @description on Status Change
     */
    onStatusChange() {
        this.onSearch();
    }

    /**
     * @description reset filter
     */
    resetFilter() {
        this.selectedDate = '';
        this.toDate = null;
        this.fromDate = null;
        for (const p in this.tempFilter) {
            this.tempFilter[p].value = null;
        }
        this.predictiveSearchId = ''
        this.onSearch();
    }

    /**
     * 
     */
    getMoreCompanies() {
        if (this.hasMoreUsers) {
            this.userListPage++
            this.getCompaniesList();
        }
    }

    /**
     * 
     * @param search 
     */
    onCompanySearch(search: any) {
        this.searchKeyword = search.term;
        this.userListPage = 1;
        this.getCompaniesList();
    }

    async getManagersList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + `?role=${Constants.Roles.BRANCHMANAGER}`, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.managersList = response.data;

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

    async getUsersList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + `?role=${Constants.Roles.UNDERWRITER}`, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.usersList = response.data;
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

    /**
     * @description on click of delete actoion
     */
    deleteMultipleLeads() {
        if (this.leadIdArray.length) {
            swal.fire({
                title: 'Are you sure to delete?',
                text: 'You will not be able to revert this!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Delete',
                confirmButtonColor: this.color,
                cancelButtonText: 'Cancel',
                backdrop: true,
                allowOutsideClick: false,
            }).then((result) => {
                if (result.value) {
                    this.actualFundRecordsArray = [];
                    for (let index = 0; index < this.leadIdArray.length; index++) {
                        let obj = this.leadsList.filter(x => x.id === this.leadIdArray[index]);
                        if (obj[0].is_deleted == 0) {
                            this.actualFundRecordsArray.push(obj[0])
                            // this.fundRecordsDeleteLeads();
                            // return
                        }
                        // else{
                        //     this.deleteLead(this.leadIdArray);
                        // }
                    }
                    if (this.actualFundRecordsArray.length) {
                        this.fundRecordsDeleteLeads();
                    } else {
                        this.deleteLead(this.leadIdArray);
                    }


                }
            })
        } else {
            this.commonService.showError("Please select atleast one lead.")
        }
    }

    /**
     * @description delete single lead
     */
    async deleteSingleLead(id: string) {
        this.deleteLead([id]);
    }

    async deleteLead(ids: Array<string>): Promise<void> {
        try {
            if (!ids.length) {
                return;
            }

            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DELETE_LEADS, { delete_id: ids }, 'lead', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                this.leadsList = this.leadsList.filter(el => !ids.includes(el.id));
                this.totalRecords = this.totalRecords - 1;
                this.leadIdArray = [];
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
    fundRecordsDeleteLeads() {
        let fundleadsIds = [];
        for (let index = 0; index < this.actualFundRecordsArray.length; index++) {
            fundleadsIds.push(this.actualFundRecordsArray[index].lead_id);

        }
        swal.fire({
            title: 'You cannot delete this lead!',
            html: 'Out of ' + (this.leadIdArray.length > 1 ? this.leadIdArray.length + ' leads,' : this.leadIdArray.length + ' lead, ') +
                (this.actualFundRecordsArray.length > 1 ? this.actualFundRecordsArray.length + ' leads' : this.actualFundRecordsArray.length + ' lead') +
                ' contains fund record, so you are unable to delete these following leads:<br> ' +
                '  Lead Id No: ' + fundleadsIds.toString() + '<br>'
                + ' Note: Please reselect your leads to perform any action',

            icon: 'warning',
            // showCancelButton: true,
            confirmButtonText: 'Ok',
            confirmButtonColor: this.color,
            // cancelButtonText: 'Cancel',
            backdrop: true,
            allowOutsideClick: false,
        }).then((result) => {
            // if (result.value) {
            //     this.deleteLead(this.leadIdArray);
            // }
        })

    }

    onChange(id: any, target: EventTarget | null, index: number) {

        const input = target as HTMLInputElement;
        if (input.checked) {
            this.leadsList[index].toggle = true;
            if (!this.leadIdArray.includes(id)) {
                this.leadIdArray.push(id);
            }
        } else {
            this.leadsList[index].toggle = false;

            let i = this.leadIdArray.findIndex(x => x === id);
            if (i > -1) {
                this.leadIdArray.splice(i, 1);
            }
        }
    }

    onCheckingAll(target: any) {
        this.leadIdArray = [];
        for (let i = 0; i < this.leadsList.length; i++) {
            this.leadsList[i].selected = target.checked;
            if (target.checked) {
                this.boo = true;

                this.leadsList[i].toggle = true;
                this.leadIdArray.push(this.leadsList[i].id);
            } else {
                this.leadsList[i].toggle = false;
                this.boo = false;



            }
        }

        // this.boo = false;
    }

    /**
     * @description lead options
     */
    async getLeadOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                if (this.userDetails?.company_type == 'broker') {
                    this.leadSourceList = response.data.lead_source;
                } else {
                    this.leadSourceList = response.data.iso;
                }
                this.leadSourceList.sort((a, b) => a.name.localeCompare(b.name))
                this.leadStatusList = response.data.status;
                this.leadStatusList.sort((a, b) => a.name.localeCompare(b.name))
                this.campaignList = response.data.campaign;
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
                this.tempFilter['Date'].value = this.selectedDate;
                this.onSearch();
            }
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



    /**
     * @description get leads listing
     */
    async getLeadsList() {
        let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&records_per_page=${this.recordsPerPage}&page=${this.page}`;
        if ((this.appliedFilter['Lead status']?.value)) {
            url = `${url}&lead_status=${this.appliedFilter['Lead status']?.value}`;
        }
        if (this.appliedFilter['Search']?.value && this.predictiveSearchId) {
            url = `${url}&search=${this.predictiveSearchId}`;
        }
        if (this.appliedFilter['Search']?.value && !this.predictiveSearchId) {
            url = `${url}&search=${encodeURIComponent(this.appliedFilter['Search']?.value).trim()}`;
        }

        if (this.appliedFilter['Date']?.value) {
            url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
        }
        if (this.appliedFilter['Full name']?.value) {
            url = `${url}&name=${encodeURIComponent(this.appliedFilter['Full name']?.value).trim()}`;
        }
        if (this.appliedFilter['First name']?.value) {
            url = `${url}&first_name=${encodeURIComponent(this.appliedFilter['First name']?.value).trim()}`;
        }
        if (this.appliedFilter['Last name']?.value) {
            url = `${url}&last_name=${encodeURIComponent(this.appliedFilter['Last name']?.value).trim()}`;
        }
        // if (this.appliedFilter['Status']?.value && this.appliedFilter['Status'].value.id) {
        //     url = `${url}&status=${this.appliedFilter['Status'].value.id}`;
        // }
        if (this.appliedFilter['Status']?.value) {
            url = `${url}&status=${this.appliedFilter['Status'].value}`;
        }
        if (this.appliedFilter['Compaign']?.value && this.appliedFilter['Compaign'].value.id) {
            url = `${url}&campaign=${this.appliedFilter['Compaign'].value.id}`;
        }
        if (this.appliedFilter['Company name']?.value) {
           
            // url = `${url}&company_name=${this.appliedFilter['Company name']?.value}`;
            url = `${url}&company_name=${ encodeURIComponent(this.appliedFilter['Company name']?.value).trim()}`;
        }
        if (this.appliedFilter['Disposition']?.value && this.appliedFilter['Disposition'].value.name) {
            url = `${url}&disposition=${this.appliedFilter['Disposition'].value.id}`;
        }
        if (this.appliedFilter['Email']?.value) {
            url = `${url}&email=${this.appliedFilter['Email']?.value}`;
        }
        if (this.appliedFilter['Exclusive lead']?.value && this.appliedFilter['Exclusive lead'].value.id) {
            url = `${url}&exclusive_lead=${this.appliedFilter['Exclusive lead'].value.id}`;
        }
        if (this.appliedFilter['ID']?.value) {
            url = `${url}&lead_id=${this.appliedFilter['ID']?.value}`;
        }
        if (this.appliedFilter['Lead Source']?.value && this.appliedFilter['Lead Source'].value.id) {
            url = `${url}&source=${this.appliedFilter['Lead Source'].value.id}`;
        }
        if (this.appliedFilter['ISO']?.value && this.appliedFilter['ISO'].value.id) {
            url = `${url}&source=${this.appliedFilter['ISO'].value.id}`;
        }
        // if (this.appliedFilter['User']?.value && this.appliedFilter['User'].value.id) {
        //     url = `${url}&underwriter_id=${this.appliedFilter['User'].value.id}`;
        // } 
        if (this.appliedFilter['Team']?.value && this.appliedFilter['Team'].value.id) {
            url = `${url}&team_id=${this.appliedFilter['Team'].value.id}`;
        }
        // if (this.appliedFilter['Manager']?.value && this.appliedFilter['Manager'].value.id) {
        //     url = `${url}&search_by_manager=${this.appliedFilter['Manager'].value.id}`;
        // }
        if (this.appliedFilter['All Users']?.value && this.appliedFilter['All Users'].value.id) {
            url = `${url}&user_id=${this.appliedFilter['All Users'].value.id}`;
        }
        if (this.appliedFilter['Company']?.value && this.appliedFilter['Company'].value.id) {
            url = `${url}&company_id=${this.appliedFilter['Company'].value.id}`;
        }
        if (this.appliedFilter['Phone']?.value) {
            url = `${url}&phone=${this.appliedFilter['Phone']?.value}`;
        }
        if (this.appliedFilter['Submitter']?.value && this.appliedFilter['Submitter'].value.id) {
            url = `${url}&submitter_id=${this.appliedFilter['Submitter'].value.id}`;
        }
        if(this.userDetails.company_type === 'funded' && this.showWaitTime){
            url = `${url}&isUnderwriting=${true}`
        }
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_LIST + url, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (response.data && response.data.data) {
                    this.predictiveSearchId = '';
                    this.leadsList = response.data.data.map((e: any) => ({ ...e, selected: false }));
                    this.selectAll.nativeElement.checked = false;
                    this.totalRecords = response.data.total_records;
                    this.leadsList.forEach((object) => { object.toggle = false });
                } else {
                    this.leadsList = [];
                }
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

    /**
     * 
     * @param id 
     * @returns 
     */
    leadDetailLink(id: string) {
        switch (this.userRole) {
            case this.roles.ADMINISTRATOR:
                return '/admin/lead-detail/' + id;
            case this.roles.COMPANY:
                return '/company/lead-detail/' + id;
            default:
                return `/${this.userBaseRoute}/lead-detail/` + id;
        }
    }

    /**
     * 
     * @param id 
     * @returns 
     */
    leadEditLink(id: string) {
        switch (this.userRole) {
            case this.roles.ADMINISTRATOR:
                return '/admin/edit-lead/' + id;
            case this.roles.COMPANY:
                return '/company/edit-lead/' + id;
            default:
                return `/${this.userBaseRoute}/edit-lead/` + id;

        }
    }

    leadCreateLink() {
        switch (this.userRole) {
            case this.roles.ADMINISTRATOR:
                return '/admin/createlead'
            case this.roles.COMPANY:
                return '/company/createlead'
            default:
                return `/${this.userBaseRoute}/createlead`

        }
    }



    /**
     * @description on page change
     * @returns {void}
     * @param p 
     */
    onPageChange(p: number): void {
        this.page = p;
        this.getLeadsList();
        if (this.page >= 2 || this.page == 1) {
            this.boo = false;
        }
    }

    /**
     * @description on limit change
     * @param value 
     * @returns {void}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    onLimitChange(value: number): void {
        this.recordsPerPage = value;
        this.page = 1;
        this.getLeadsList();
    }


    redirectLeadDetail(id: any) {
        if (!this.canViewLead) return;
        // window.open(this.router.navigate([`/${this.userBaseRoute}/lead-detail/${id}`]), "_blank");
        this.router.navigate([`/${this.userBaseRoute}/lead-detail/${id}`])

        // switch (this.userRole) {
        //     case this.roles.ADMINISTRATOR:
        //         this.router.navigate([`/admin/lead-detail/${id}`])
        //         break;
        //     case this.roles.COMPANY:
        //         this.router.navigate([`/company/lead-detail/${id}`])
        //         break;
        //     default:
        //         this.router.navigate([`/${this.userBaseRoute}/lead-detail/${id}`])
        //         break;
        // }
    }
    openModel(content: any) {
        try {
            this.modal = this.modalService.open(content, { backdrop: 'static' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    closeModal() {
        this.modal.close();
        this.importForm.reset();
        this.searchKeyword = ''
    }
    // xlsx to json converter 
    sliceIntoChunks(arr: any, chunkSize: number) {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            res.push(chunk);
        }
        return res;
    }

    onFileChange(ev: any, input: any) {
        for (var i = 0; i < ev.target.files.length; i++) {
            //2MB maximum file
            if (ev.target.files[i].size / 1024 / 1024 > 15) {
                input.value = ''
                this.commonService.showError('Maximum file size allowed is 15MB')
            }
            else if (!Constants.SETTINGS.ALLOWED_CSV_FILES.includes(ev.target.files[i].type)) {
                input.value = '';
                this.commonService.showError('Invalid file type. Allowed file type are -xlsx|xls|text/csv|application/vnd.ms-excel|spreadsheetml.sheet')
            }
            else {
                let workBook: any = null;
                let jsonData = null;
                const reader = new FileReader();
                const file = ev.target.files[0];
                reader.onload = (event) => {
                    const data = reader.result;
                    workBook = XLSX.read(data, { type: 'binary' });

                    jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
                        const sheet = workBook.Sheets[name];
                        initial[name] = XLSX.utils.sheet_to_json(sheet);
                        return initial;
                    }, {});

                    const dataString = JSON.stringify(jsonData);
                    if (jsonData) {
                        let keys = Object.keys(jsonData);
                        if (keys.length) {
                            let xlFileData = jsonData[keys[0]];
                            if (xlFileData) {
                                var val = "First name";
                                val = val.toLowerCase();
                                var phonenumber = "Phone number";
                                phonenumber = phonenumber.toLowerCase();
                                var exists = xlFileData.filter(function (o: any) {
                                    const newObj = Object.fromEntries(
                                        Object.entries(o).map(([k, v]) => [k.toLowerCase(), v])
                                    );
                                    return newObj.hasOwnProperty(val);
                                }).length > 0;

                                var phoneexists = xlFileData.filter(function (o: any) {
                                    const newObj = Object.fromEntries(
                                        Object.entries(o).map(([k, v]) => [k.toLowerCase(), v])
                                    );
                                    return newObj.hasOwnProperty(phonenumber);
                                }).length > 0;

                                if (exists && phoneexists) {
                                    let whitespace = new RegExp(/\s/g);
                                    let newArray = xlFileData.map((entry: any) => {
                                        let modified: any = {};
                                        Object.keys(entry).forEach((key) => {
                                            let value = entry[key]; key = key.toLowerCase().replace(whitespace, "_");
                                            modified[key] = value;
                                            // modified[key] = value.toString().replaceAll("-", "");

                                        });

                                        return modified;
                                    });
                                    this.leadImportArray = newArray;
                                    // console.log(this.sliceIntoChunks(this.leadImportArray,100));



                                } else {
                                    input.value = '';
                                    this.commonService.showError("It seems First name and Phone number is missing in file. Please check and try again");
                                    return;
                                }
                            } else {
                                input.value = '';
                                this.commonService.showError("It seems First name and Phone number is missing in file. Please check and try again");
                                return;
                            }
                        }
                    }





                }
                reader.readAsBinaryString(file);
            }
        }
    }

    // uploadDoc(event: any, input: any) {

    //          for (var i = 0; i < event.target.files.length; i++) {
    //         console.log(event.target.files[i].type);

    //         if (event.target.files[i].size / 1024 / 1024 > 3000) {
    //             input.value = ''
    //             this.commonService.showError('Maximum file size allowed is 300MB')
    //         }
    //         else if (!Constants.SETTINGS.ALLOWED_CSV_FILES.includes(event.target.files[i].type)) {
    //             input.value = '';
    //             this.commonService.showError('Invalid file type. Allowed file type are -xlsx|xls|text/csv|application/vnd.ms-excel|spreadsheetml.sheet')
    //         }
    //         else if(event.target.files[i].size / 1024 / 1024 < 30){ 
    //             let workBook: any = null;
    //             let jsonData = null;
    //             const reader = new FileReader();
    //             const file = event.target.files[0];
    //             reader.onload = (event) => {
    //                 const data = reader.result;
    //                 workBook = XLSX.read(data, { type: 'binary' });

    //                 jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
    //                     const sheet = workBook.Sheets[name];
    //                     initial[name] = XLSX.utils.sheet_to_json(sheet);
    //                     return initial;
    //                 }, {});

    //                 const dataString = JSON.stringify(jsonData);
    //                 console.log(dataString,'data');

    //                 if(jsonData) {
    //                     let keys = Object.keys(jsonData);
    //                     if(keys.length) {
    //                         let xlFileData =  jsonData[keys[0]];
    //                         if (xlFileData) {
    //                             var val = "First name";
    //                             val = val.toLowerCase();
    //                             var phonenumber = "Phone number";
    //                             phonenumber = phonenumber.toLowerCase();
    //                             var exists = xlFileData.filter(function (o: any) {
    //                                 const newObj = Object.fromEntries(
    //                                     Object.entries(o).map(([k, v]) => [k.toLowerCase(), v])
    //                                   );
    //                                 return newObj.hasOwnProperty(val);
    //                             }).length > 0;

    //                             var phoneexists = xlFileData.filter(function (o: any) {
    //                                 const newObj = Object.fromEntries(
    //                                     Object.entries(o).map(([k, v]) => [k.toLowerCase(), v])
    //                                   );
    //                                 return newObj.hasOwnProperty(phonenumber);
    //                             }).length > 0;

    //                             if (exists && phoneexists) {
    //                                 let whitespace = new RegExp(/\s/g);
    //                                 let newArray = xlFileData.map((entry: any) => {
    //                                     let modified: any = {};
    //                                     Object.keys(entry).forEach((key) => {
    //                                         let value = entry[key]; key = key.toLowerCase().replace(whitespace, "_");
    //                                         modified[key] = value;
    //                                     });

    //                                     return modified;
    //                                 });
    //                                 this.leadImportArray = newArray;
    //                             } else {
    //                                 input.value = '';
    //                                 this.commonService.showError("It seems First name and Phone number is missing in file. Please check and try again");
    //                                 return;
    //                             }
    //                         } else {
    //                             input.value = '';
    //                             this.commonService.showError("It seems First name and Phone number is missing in file. Please check and try again");
    //                             return;
    //                         }
    //                     }
    //                 }





    //             }
    //             reader.readAsBinaryString(file);
    //         }else {
    //             let lastChunksize = 0;
    //             var file = event.target.files[0];

    //             this.readFile(file, lastChunksize, this.myCallback.bind(this));
    //         }
    //     }


    //    }

    //    myCallback(file: any, lastChunksize: any, result: any) {
    //     lastChunksize = lastChunksize + 20000;
    //    if(result) {
    //       //Add you logic what do you want after reading the file
    //       let workBook: any = null;
    //        let jsonData = null;
    //       const data = result;
    //               workBook = XLSX.read(data, { type: 'binary' });

    //               jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
    //                   const sheet = workBook.Sheets[name];
    //                   let initial_names = ''
    //                   initial[name] = XLSX.utils.sheet_to_json(sheet);
    //                   initial_names = initial[name]; 
    //                   return initial;
    //               }, {});   
    //             //   let actualjsonData = []
    //             //   actualjsonData.push(jsonData);
    //             // //   const dataString = JSON.stringify(actualjsonData);
    //             //   console.log("data", actualjsonData);
    //               if(jsonData) {
    //                         let keys = Object.keys(jsonData);
    //                         if(keys.length) {
    //                             let xlFileData =  jsonData[keys[0]];
    //                             console.log("bjhbh",xlFileData );
    //                             let whitespace = new RegExp(/\s/g);
    //                                         let newArray = xlFileData.map((entry: any) => {
    //                                             let modified: any = {};
    //                                             Object.keys(entry).forEach((key) => {
    //                                                 let value = entry[key]; key = key.toLowerCase().replace(whitespace, "_");
    //                                                 modified[key] = value;
    //                                             });

    //                                             return modified;
    //                                         });
    //                                         for(var i = 0; i < newArray.length ; i++){
    //                                             this.leadImportArray.push(newArray[i]);
    //                                         }
    //                                         console.log("njbj", this.leadImportArray);

    //                                     }
    //                         //     if (xlFileData) {
    //                         //         var val = "First name";
    //                         //         val = val.toLowerCase();
    //                         //         var phonenumber = "Phone number";
    //                         //         phonenumber = phonenumber.toLowerCase();
    //                         //         var exists = xlFileData.filter(function (o: any) {
    //                         //             const newObj = Object.fromEntries(
    //                         //                 Object.entries(o).map(([k, v]) => [k.toLowerCase(), v])
    //                         //               );
    //                         //             return newObj.hasOwnProperty(val);
    //                         //         }).length > 0;

    //                         //         var phoneexists = xlFileData.filter(function (o: any) {
    //                         //             const newObj = Object.fromEntries(
    //                         //                 Object.entries(o).map(([k, v]) => [k.toLowerCase(), v])
    //                         //               );
    //                         //             return newObj.hasOwnProperty(phonenumber);
    //                         //         }).length > 0;

    //                         //         if (exists && phoneexists) {
    //                         //             let whitespace = new RegExp(/\s/g);
    //                         //             let newArray = xlFileData.map((entry: any) => {
    //                         //                 let modified: any = {};
    //                         //                 Object.keys(entry).forEach((key) => {
    //                         //                     let value = entry[key]; key = key.toLowerCase().replace(whitespace, "_");
    //                         //                     modified[key] = value;
    //                         //                 });

    //                         //                 return modified;
    //                         //             });
    //                         //             this.leadImportArray = newArray;
    //                         //         } 
    //                         //     //     else {
    //                         //     //         // input.value = '';
    //                         //     //         this.commonService.showError("It seems First name and Phone number is missing in file. Please check and try again");
    //                         //     //         return;
    //                         //     //     }
    //                         //     // } else {
    //                         //     //     // input.value = '';
    //                         //     //     this.commonService.showError("It seems First name and Phone number is missing in file. Please check and try again");
    //                         //     //     return;
    //                         //     // }
    //                         // }
    //                     }




    //       this.readFile(file, lastChunksize, this.myCallback.bind(this));
    //     } else {
    //       ///end recursion
    //     }
    //    }

    //    readFile(file: any,lastChunksize: number, callback: any) {
    //     var fileBlob = file.slice(lastChunksize,lastChunksize+20000);
    //     console.log("cvfd", fileBlob)
    //     if(fileBlob.size !=0) {
    //       let fileReader = new FileReader();
    //       fileReader.onloadend= (result)=>{
    //       return callback(file,lastChunksize,fileReader.result)
    //       }
    //       fileReader.readAsText(fileBlob);
    //     }else {
    //         console.log("tptal", file);
    //      return callback(file,lastChunksize,false);

    //     }

    //     // let workBook: any = null;
    //     // let jsonData = null;
    //     // const reader = new FileReader();
    //     // // const file = event.target.files[0];
    //     // reader.onload = (event) => {
    //     //     const data = reader.result;
    //     //     workBook = XLSX.read(data, { type: 'binary' });

    //     //     jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
    //     //         const sheet = workBook.Sheets[name];
    //     //         initial[name] = XLSX.utils.sheet_to_json(sheet);
    //     //         return initial;
    //     //     }, {});

    //     //     const dataString = JSON.stringify(jsonData);
    //     //     console.log(dataString,'data');

    //     //     if(jsonData) {
    //     //         let keys = Object.keys(jsonData);
    //     //         if(keys.length) {
    //     //             let xlFileData =  jsonData[keys[0]];
    //     //             if (xlFileData) {
    //     //                 var val = "First name";
    //     //                 val = val.toLowerCase();
    //     //                 var phonenumber = "Phone number";
    //     //                 phonenumber = phonenumber.toLowerCase();
    //     //                 var exists = xlFileData.filter(function (o: any) {
    //     //                     const newObj = Object.fromEntries(
    //     //                         Object.entries(o).map(([k, v]) => [k.toLowerCase(), v])
    //     //                       );
    //     //                     return newObj.hasOwnProperty(val);
    //     //                 }).length > 0;

    //     //                 var phoneexists = xlFileData.filter(function (o: any) {
    //     //                     const newObj = Object.fromEntries(
    //     //                         Object.entries(o).map(([k, v]) => [k.toLowerCase(), v])
    //     //                       );
    //     //                     return newObj.hasOwnProperty(phonenumber);
    //     //                 }).length > 0;

    //     //                 if (exists && phoneexists) {
    //     //                     let whitespace = new RegExp(/\s/g);
    //     //                     let newArray = xlFileData.map((entry: any) => {
    //     //                         let modified: any = {};
    //     //                         Object.keys(entry).forEach((key) => {
    //     //                             let value = entry[key]; key = key.toLowerCase().replace(whitespace, "_");
    //     //                             modified[key] = value;
    //     //                         });

    //     //                         return modified;
    //     //                     });
    //     //                     this.leadImportArray = newArray;
    //     //                 } else {
    //     //                     // input.value = '';
    //     //                     this.commonService.showError("It seems First name and Phone number is missing in file. Please check and try again");
    //     //                     return;
    //     //                 }
    //     //             } else {
    //     //                 // input.value = '';
    //     //                 this.commonService.showError("It seems First name and Phone number is missing in file. Please check and try again");
    //     //                 return;
    //     //             }
    //     //         }
    //     //     }





    //     // }
    //     // reader.readAsBinaryString(file);
    //    }
    async onSubmit() {
        try {
            let PayloadLeaddata = this.sliceIntoChunks(this.leadImportArray, 300)
            // PayloadLeaddata.forEach(element => {
            //     if (this.leadCreateFromJson) {
            //         this.onLeadImportsave(element);
            //         if (!this.leadCreateFromJson) {
            //             return ;
            //         }
            //          }
            // });

            for (let i = 0; i < PayloadLeaddata.length; i++) {
                this.commonService.showSpinner();
                if (this.leadCreateFromJson) {
                    await this.onLeadImportsave(PayloadLeaddata[i]);
                    this.totalchunkDataSubmit += PayloadLeaddata[i].length;
                }
            }
            if (this.totalchunkDataSubmit == this.leadImportArray.length) {
                this.commonService.hideSpinner();
                this.leadImportArray = [];
                this.uploadJsonFormatter();
                this.getLeadsList();
                this.importForm.reset();
                this.searchKeyword = '';
            }
        }
        catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showError(error?.error?.message)
        }
    }
    async onLeadImportsave(value: any) {
        try {
            this.importForm.markAllAsTouched();
            if (Roles.ADMINISTRATOR == this.userRole) {
                this.importForm.get('company_id')?.setValidators([Validators.required]);
                this.importForm.get('company_id')?.updateValueAndValidity();
                this.importForm.get('company_id')?.markAsTouched();
            } else {
                this.importForm.get('company_id')?.clearValidators();
                this.importForm.get('company_id')?.updateValueAndValidity();
            }

            if (this.importForm.valid) {
                // if (!this.leadImportArray.length) {
                //     this.commonService.showError("Please import other file");
                //     return;
                // }
                if (!value.length) {
                    this.commonService.showError("Please import other file");
                    return;
                }
                // leads: this.leadImportArray,
                let data = {
                    leads: value,
                    ...this.importForm.value
                }
                const res$ = this.apiService.postReq(API_PATH.LEAD_IMPORT, data, 'lead', 'view');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSpinner();
                    this.boo = false
                    // console.log("vnnh", this.totalchunkDataSubmit, this.leadImportArray.length)
                    if (this.totalchunkDataSubmit == this.leadImportArray.length) {
                        this.commonService.hideSpinner();
                        this.leadImportArray = [];
                        this.uploadJsonFormatter();
                        this.getLeadsList();
                        this.importForm.reset();
                        this.searchKeyword = '';
                    } else {
                        this.commonService.showSpinner()
                    }

                    // this.commonService.showSuccess(response.message);
                    // this.leadImportArray = [];

                }

                // this.commonService.hideSpinner();
            }

        } catch (error: any) {
            this.leadCreateFromJson = false;
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    uploadJsonFormatter() {
        this.closeModal();
    }



    async duplicateLead(id: any) {
        try {
            let url = `?lead_id=${id}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.DUPLICATE_LEADS + url, 'lead', 'edit');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                this.getLeadsList()
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

    get50PerColor() {
        let color = this.adjustBackgroundColor(this.color, 150);
        return color;
    }
    adjustBackgroundColor(color: any, amount: any) {
        return '#' + color.replace(/^#/, '').replace(/../g, (color: string) => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }
    
    ngOnDestroy() {
        if (this.routeSubscription) {
            this.routeSubscription.unsubscribe();
        }
    }
        // sort coloumn
        sortBy(col: string) {
            if (!this.leadsList.length) {
                return
            }
            if (this.search.sortby === col) {
                if (this.search.order === 'ASC') {
                    this.search.order = 'DESC'
                } else {
                    this.search.order = 'ASC'
                }
            } else {
                this.search.sortby = col;
                this.search.order = 'DESC';
            }
            this.getLeadsList();
        }
          //get all users List:-
          async getAllUser() {
            try {
                // + `?role=${Roles.UNDERWRITER}`
                let url = `?sort_by=${'created_at'}&dir=${'DESC'}&assigned_to=assignedTo`;
                this.commonService.showSpinner();
                const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + url, 'user', 'list');
                let response = await lastValueFrom(res$);
                if (response && response.data) {
                    this.getAllUserList = response?.data?.sort((a:any, b:any) => a.name.localeCompare(b.name));
                    } else {
                        this.getAllUserList = [];
                        // this.hasMoreUsers = false;
                        // this.userListPage = 1;
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
    // get Team list
    async getTeamlist(): Promise<any> {
        try {
            let url = `?sort_by=${'created_at'}&dir=${'DESC'}&page_limit=${10000}&page=${1}`;
            this.commonService.showSpinner();
            // update for team
            const res$ = this.apiService.getReq(API_PATH.TEAM_LIST + url, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response.data && response.data.data) {
                // this.hasMoreUsers = response.data.hasMorePages;
                // this.totalUsersCount = response.data.total;
                this.getTeamList = response?.data?.data?.sort((a:any, b:any) => a.name.localeCompare(b.name));

            } else {
                this.getTeamList = [];
                // this.hasMoreUsers = false;
                // this.userListPage = 1;
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
    valueRestUserTeam(status:string){
        if(status == 'teams'){
            this.tempFilter['All Users'].value = null
        }else if(status == 'users'){
            this.tempFilter['Team'].value = null
        }
        // console.log(da = null);
        
    }
    //leadAccess check 4th oct
    async onLeadAccessCheck() {
        try {
            this.commonService.showSpinner();
                let data = {
                  lead_id:this.lsLeadId
                }
                const res$ = this.apiService.postReq(API_PATH.LEAD_ACCESS_CHECK, data, 'lead', 'list');
                let response = await lastValueFrom(res$);
                if (response) {
            this.commonService.showSpinner();
                    if(response?.data?.lead_id){
                        this.router.navigate([`/${this.userBaseRoute}/lead-detail/${response?.data?.lead_id}`])
                    }else{
                    Swal.fire({
                        title: response?.message,
                        icon: 'warning',
                        // showCancelButton: true,
                        confirmButtonText: 'OK',
                        confirmButtonColor: this.color,
                    }).then((result) => {
                        if (result.value) {
                            // this.sendMailForm.patchValue({ from_option_scratch: "" });
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            Swal.close()
                        }
                    })
                    }
            //  this.router.navigate([`/${response.data.role.toLowerCase()}/lead-detail/${response.data.lead_id}`])
                    localStorage.removeItem(Constants.SETTINGS.LEAD_ID)
                this.commonService.hideSpinner();

                }
                  
                this.commonService.hideSpinner();
            }

        catch (error: any) {
            this.leadCreateFromJson = false;
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
  
}

