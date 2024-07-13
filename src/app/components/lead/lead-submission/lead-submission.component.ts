import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { NgbAccordion, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-lead-submission',
    templateUrl: './lead-submission.component.html',
    styleUrls: ['./lead-submission.component.scss'],
})
export class LeadSubmissionComponent implements OnInit {
    basicForm!: FormGroup;
    lenderForm!: FormGroup;
    isBasicForm: boolean = false;
    leadID: string = '';
    docsList: Array<any> = [];
    companyName: string = '';
    lead: any = {};
    userRole: string = '';
    lendersList: any[] = [];
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    colorCheckbox: boolean = false;
    colorCheckbox2: boolean = false;
    colorCheckbox3: boolean = false;
    documentcheckbox: boolean = false;
    submissionNotesList: Array<any> = [];
    submissionpage: number = 1;
    submissiontotal: number = 0;
    limit: number = 100;
    dateFormat: string = '';
    timeZone: string = '';
    statesList: Array<any> = [];
    submittedlendersList: Array<any> = [];
    @Output() onLeadStatusChanges = new EventEmitter<any>()
    @ViewChild('sendSubmiision', { static: false }) sendSubmiision!: NgbAccordion;
    modal!: NgbModalRef;
    declineForm!: FormGroup;
    @ViewChild('rejectOffer') rejectOffer!: ElementRef;
    lenderID: string = ''
    showPaperPlane: boolean = false;
    companyType: string = '';
    selectBox: boolean = false
    getFCSurl:string='';
    isAllowedFCSsheet:boolean = false;
    fcsDetailList: any;
    activelenderList: any;
    note: any;
    withHoldValue:any;
    constructor(
        private fb: FormBuilder,
        private el: ElementRef,
        private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private modalService: NgbModal
    ) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLeadDetails();
            this.getsubmittedlendersList();
        } else {
            this.commonService.showError('');
        }
        this.initBasicForm();
        this.initLenderForm();
        this.getUserDetails();
        this.getDocsAndCompany();
        this.getlendersList();
        this.getSubmissionNotes();
        this.getfcsDetail()
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
                this.userRole = ud.role;
                this.timeZone = ud.time_zone;
                this.color = ud?.color;
                this.dateFormat = ud.date_format;
                this.style = { fill: ud?.color };
                this.companyType = ud.company_type;
                this.background = { background: ud?.color };
                this.getColorOnUpdate();

            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    toggleSendsubmission(ID: string) {
        setTimeout(() => this.sendSubmiision.toggle(ID), 0);
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
    getDate(date: any) {
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }

    async getLeadDetails() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_DETAILS + this.leadID, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lead = response.data;
                if (this.lead.is_freeze != 0) {
                    this.lenderForm?.controls['documents'].disable();
                    this.lenderForm?.controls['lenders'].disable();

                } else {
                    this.lenderForm?.controls['documents'].enable();
                    this.lenderForm?.controls['lenders'].enable();

                }
                // this.lenderForm.patchValue({state_id: this.lead.state_name})
                // this.getStates(this.lead.encrypted_country_id);
                if (this.lead.is_lead_submitted) {
                    this.commonService.showError("Lead is already submitted.");
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/${this.leadID}`]);
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
    async getStates(country_id: string) {
        try {
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                setTimeout(() => {
                    this.lenderForm.patchValue({ state_id: this.lead.encrypted_state_id })
                })

            }
        } catch (error: any) {
            // this.uploading = false;
            this.commonService.hideSpinnerWithId('uploading');
            this.commonService.showErrorMessage(error);
        }
    }
    /**
     * @description initilize lender form
     */
    initLenderForm() {
        this.lenderForm = this.fb.group({
            submission_through: ["SUBMISSION"],
            custom_note: ['', [
                // Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                // Validators.maxLength(1000),
                // Validators.minLength(3)
            ]],
            lender_type: ['email'],
            // state_id: [''],
            lenders: ['', [Validators.required]],
            documents: [null, [Validators.required]]
        })

        if (this.lenderForm.value.lender_type == 'email') {
            this.colorCheckbox = true;
        } else {
            this.colorCheckbox = false;
        }

    }

    /**
     * @description initilize basic form
     */
    initBasicForm() {
        this.basicForm = this.fb.group({
            credit_score: [null, [Validators.pattern(Custom_Regex.amount)]],
            negative_days: [null, [Validators.pattern(Custom_Regex.amount)]],
            nsfs: [null, [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.digitsOnly)]],
            advance: [null, [Validators.pattern(Custom_Regex.amount)]],
            time_in_business: [null, [Validators.pattern(Custom_Regex.amount)]],
            amount: [null, [Validators.pattern(Custom_Regex.amount)]],
            position: [null, [Validators.pattern(Custom_Regex.amount)]],
            deposits: [null, [Validators.pattern(Custom_Regex.amount)]],
            daily_weekly: [""],
            term_months: [null, [Validators.pattern(Custom_Regex.amount)]],
            sole_prop: [""],
            non_profit: [""],
            consolidation: [""],
        })
    }
    async getlendersList() {
        try {
            const res$ = this.apiService.postReq(API_PATH.LENDERS_LIST, { lead_id: this.leadID }, 'propose', 'submission');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.lendersList = response.data.lenders;
                this.getFCSurl = response?.data?.view_sheet
                this.isAllowedFCSsheet = response?.data?.fcs_saved
                
                let arr = [];
                let array1 = [];
                arr = this.lendersList.filter((e: any) => e.is_selected == 1);
                for (let i = 0; i < arr.length; i++) {
                    array1.push(arr[i].id)
                }
                this.lenderForm.patchValue({
                    lenders: array1,
                    custom_note: response.data.note
                })

            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    /**
     * @description submit lead submiision  
     */
    async finalSubmission() {
        try {
            this.lenderForm.markAllAsTouched();
            if (this.lenderForm.valid) {
                if (!this.docsList.length) {
                    this.commonService.showError("Please add documents first");
                    return;
                }
                let data = {
                    ...this.basicForm.value,
                    ...this.lenderForm.value,
                    // documents: this.docsList.map(e => (e.document_id)),
                    lead_id: this.leadID
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_SUBMISSION, data, 'lead', 'edit');
                const response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.onLeadStatusChanges.emit('response');
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID],
                        // { queryParams: { activeTab: 'Updates' } });
                        // { queryParams: { activeTab: 'Send Submission' } });
                        { queryParams: { activeTab: 'Documents' } });
                    this.getSubmissionNotes();
                    this.initLenderForm();
                    this.getsubmittedlendersList();
                    this.getlendersList();


                } else {
                    this.commonService.showError(response.message);
                }
                this.commonService.hideSpinner();
            }
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }




    get f(): { [key: string]: AbstractControl } {
        return this.basicForm.controls;
    }

    get l(): { [key: string]: AbstractControl } {
        return this.lenderForm.controls;
    }


    async basicFormSubmit() {
        try {
            this.basicForm.markAllAsTouched();
            if (this.basicForm.valid) {
                this.isBasicForm = false;
                this.getDocsAndCompany();
                this.getlendersList();
            } else {
                this.focusInvalidField();
            }
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
     * @description focus first invalid field
     */
    focusInvalidField() {
        const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
            ".form-group .ng-invalid"
        );
        if (firstInvalidControl)
            firstInvalidControl.focus();
    }


    async getshowAllDocuments(e: any) {
        if (e.target.checked) {
            this.documentcheckbox = true;
            try {
                let data = {
                    lead_id: this.leadID,
                    records_per_page: -1
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_DOCUMENTS, data, 'lead', 'edit');
                const response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.docsList = response.data.documents;
                    let allDocs = [];
                    for (let index = 0; index < this.docsList.length; index++) {
                        allDocs.push(this.docsList[index].document_id)
                    }
                    if (this.documentcheckbox && this.selectBox) {
                        this.lenderForm.patchValue({
                            documents: allDocs
                        })
                    } else {
                        this.lenderForm.patchValue({
                            documents: []
                        })
                    }
                    this.companyName = response.data.company_detail.full_name;
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
        } else {
            this.documentcheckbox = false;
            this.getDocsAndCompany();
        }

    }

    checkBoxColor(value: any) {
        if (value == 'email') {
            this.colorCheckbox = true;
        } else {
            this.colorCheckbox = false;
        }
        if (value == 'ondeck') {
            this.colorCheckbox2 = true;
        } else {
            this.colorCheckbox2 = false;
        } if (value == 'kapitus') {
            this.colorCheckbox3 = true;
        } else {
            this.colorCheckbox3 = false;
        }
    }
    getChangeDocName(value: any) {
        let v1 = value.split('-');
        let v2 = v1[0].split('_');
        for (var i = 0; i < v2.length; i++) {
            v2[i] = v2[i].charAt(0).toUpperCase() + v2[i].slice(1);
        }
        const str2 = v2.join(" ");
        return str2
    }
    /**
 * @description get lead updatessss
 */
    async getSubmissionNotes() {
        try {
            let url = `?page_limit=${this.limit}&page=${this.submissionpage}&lead_id=${this.leadID}`;
            this.commonService.showSpinner();
            let res$ = this.apiService.getReq(API_PATH.SEND_SUBMISSION_NOTES + url, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data.data) {
                    this.submissionNotesList = response.data.data;
                    this.submissiontotal = response.data.total
                } else {
                    this.submissionNotesList = [];
                    this.submissiontotal = 0;
                    this.submissionpage = 1;
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
    async getDocsAndCompany() {
        try {
            let data = {
                lead_id: this.leadID,
                specific_time: '90days',
                records_per_page: -1,
                // sort_by:'document_type',
                // order_by:'ASC',
                // type:'submission'
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_DOCUMENTS, data, 'lead', 'edit');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.docsList = response.data.documents?.sort((a:any, b:any) => a.document_type.localeCompare(b.document_type));
                this.companyName = response.data.company_detail.full_name;
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
    async getsubmittedlendersList() {
        try {
            const res$ = this.apiService.postReq(API_PATH.SUBMITTED_DEALS_LENDER_LIST, { lead_id: this.leadID }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.submittedlendersList = response.data;
                this.submittedlendersList.forEach(object => {
                    object.toggle = false
                });
                for (let i = 0; i < this.submittedlendersList.length; i++) {
                    if (this.submittedlendersList[i].status == 1 || this.submittedlendersList[i].status == 3) {
                        this.submittedlendersList[i].toggle = true;
                    } else {
                        this.submittedlendersList[i].toggle = false;
                    }
                }


            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    onChangeLender(lenderID: any, name: any, input: any, i: any) {
        this.lendersList[i].toggle = true;
        if (!input.checked) {
            this.lendersList[i].toggle = false
        }
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you recieved the offer from lender' + ' - ' + name + '?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: this.color,
            // cancelButtonText: 'OK'
        }).then((result) => {
            if (result.value) {
                this.updateLenderOfferStatus(lenderID, 1, 1, input, 'accept');
                // this.getLeadDetailsList();
                // this.leadUpdateLogs?.getLeadUpdates();

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
                input.checked = 0;
                // this.checkBoxColor = false;
                this.lendersList[i].toggle = false

            }
        })
    }

    /**
 * 
 * @param lenderID 
 * @param status_type 1 for response from lender, 2 for order acceptence for that lender
 * @param status 
 */
    async updateLenderOfferStatus(lenderID: string, status_type: number, status: number, input: any = null, type: any) {
        try {
            this.commonService.showSpinner();
            let data = {}
            if (type == 'accept') {
                data = {
                    lead_id: this.leadID,
                    lender_id: lenderID,
                    status_type: status_type,
                    status: status,
                    other_confirmation: status,

                }
            } else {
                data = {
                    lead_id: this.leadID,
                    lender_id: lenderID,
                    status_type: status_type,
                    status: status,
                    other_confirmation: status,
                    // decline_reason: this.declineForm.value.reason_note

                }
            }
            const res$ = this.apiService.postReq(API_PATH.UPDATE_LENDER_OFFER_STATUS, data, 'lead', 'submission');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                if (status_type == 3) {
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                    // this.activeTab = 'Lender Offers'
                } else {
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                    // this.activeTab = 'Documents'
                }

                this.getlendersList();
                // this.leadUpdateLogs?.getLeadUpdates();
            } else {
                this.commonService.showError(response.message);
                if (input)
                    input.checked = 0;
            }
            this.commonService.hideSpinner();
        } catch (error) {
            if (input)
                input.checked = 0;
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    check(name: any, lenderID: string) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to accept the offer from lender' + ' - ' + name + '?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: this.color,
        }).then((result) => {
            if (result.value) {
                this.updateLenderOfferStatus(lenderID, 2, 1, '', 'accept');
                // this.getLeadDetailsList();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
            }
        })
    }
    //modal
    openModalDecline(templateRef: any) {
        // this.closeTriggerModal();
        // this.emailTemplateId = id
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    closeDeclineModal() {
        this.modal.close();
    }
    //
    get ff(): { [key: string]: AbstractControl } {
        return this.declineForm.controls;
    }
    initDeclineForm() {
        this.declineForm = this.fb.group({
            reason_note: ['', [Validators.required]]
        })
    }
    declineOfferPopup(lenderID: any) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to reject the offer?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: this.color,
        }).then(async (result) => {
            if (result.value) {
                this.lenderID = lenderID;
                this.initDeclineForm();
                this.openModalDecline(this.rejectOffer);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
                // this.checkBoxColor = false;
            }
        })
    }
    getdeclineUpdate() {
        this.declineForm.markAllAsTouched();
        if (this.declineForm.valid) {
            const lenderId = this.lenderID
            this.updateLenderOfferStatus(lenderId, 3, 2, '', 'decline');
            this.closeModal();
        }
    }
    closeModal() {
        this.modal.close();
    }
    get userBaseRoute() {
        return this.authService.getUserRole()
    }
    getAllDocSelected(e: any) {
        try {
            let allDocs = [];
            for (let index = 0; index < this.docsList.length; index++) {
                allDocs.push(this.docsList[index].document_id)
            }
            if (e.target.checked) {
                this.selectBox = true;
                this.lenderForm.patchValue({
                    documents: allDocs
                })
            } else {
                this.selectBox = false;
                this.lenderForm.patchValue({
                    documents: []
                })
            }
            let docuemntSize = 0;
            this.docsList.filter((e: any) => {
                this.lenderForm.value.documents.filter((m: any) => {
                    if (e?.document_id == m) {
                        docuemntSize += Number(e?.document_size);
                    }
                })
            })
            if (docuemntSize) {
                if (docuemntSize / 1024 / 1024 > 30) {
                    e.target.checked = false;
                    let msg = 'Document attachment limit has reached, please select manually.'
                    Swal.fire({
                        title: msg,
                        icon: 'warning',
                        showCancelButton: false,
                        confirmButtonText: ' Ok',
                        confirmButtonColor: this.color,
                        cancelButtonText: 'Cancel'
                    })
                    // let popattachment = this.lenderForm.value.documents.pop();
                    this.lenderForm.patchValue({
                        documents: []
                    })

                }
            }
        } catch (e) {
            console.log(e)
        }

    }
    getAllDocsStatus(event: any) {
        let value = this.lenderForm.value.documents;
        let document: any = []
        for (let index = 0; index < this.docsList.length; index++) {
            document.push(this.docsList[index].document_id)
        }
        let difference = document.filter((x: any) => !value.includes(x)).concat(value.filter((x: any) => !document.includes(x)));
        // value.length == document.length
        if (!difference.length) {
            this.selectBox = true;
        } else {
            this.selectBox = false;

        }
    }
    ngAfterContentChecked(): void {

        let value = this.lenderForm.value.documents;
        if (!value?.length) {
            this.selectBox = false
        }
    }
    getDocumentValue() {
        let docuemntSize = 0;
        this.docsList.filter((e: any) => {
            this.lenderForm.value.documents.filter((m: any) => {
                if (e?.document_id == m) {
                    docuemntSize += Number(e?.document_size);
                }
            })
        })
        if (docuemntSize) {
            if (docuemntSize / 1024 / 1024 > 30) {
                let msg = 'Document attachment limit has reached, you can\'t select more documents'
                Swal.fire({
                    title: msg,
                    icon: 'warning',
                    showCancelButton: false,
                    confirmButtonText: ' Ok',
                    confirmButtonColor: this.color,
                    cancelButtonText: 'Cancel'
                })
                let popattachment = this.lenderForm.value.documents.pop();
                this.lenderForm.patchValue({
                    documents: this.lenderForm.value.documents
                })

            } else {

            }
        }
    }
    fcsSheetNotprepare(){
        try{
            this.commonService.showError('No FCS Sheet is created yet');
        }catch(e){
            console.log(e);
            
        }
    }
    //get fcslender list
    async getfcsDetail() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.FCS_LEAD_DETAILS, { lead_id: this.leadID }, 'fcs', ' preview');
            const response = await lastValueFrom(res$);
            if (response && response.data) {
                this.fcsDetailList = response.data;
                this.withHoldValue =Number(this.fcsDetailList?.withholding_percentage).toFixed(2);
                this.activelenderList = response.data.lender;
                
                this.activelenderList = response.data.lender.map((e: any) => ({ ...e, selected: false }));
                this.note = this.fcsDetailList.note
              //  this.selectAll.nativeElement.checked = false;
            //    this.activelenderList.forEach((object) => { object.toggle = false });
               
                 
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if(error?.error?.message != 'FCS not saved yet.'){
                this.commonService.showErrorMessage(error);
            }
           
        }
    }
    getDateLender(date: any) {
        // .tz(this.timeZone)
        if(date){
            return moment(date).format(`${this.dateFormat}`)
        } else{
             return ''
        }

     
    }
    getAdjustment(monthly: number, monthlytruerevenue: any){
        let adjustmentvalue = 0;
        if(monthly && monthlytruerevenue){
            adjustmentvalue = Number(monthly) - Number(monthlytruerevenue);
            return adjustmentvalue
        }else{
            return ''
        }  
    }

}
