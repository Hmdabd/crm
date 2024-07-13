import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask, Roles } from '@constants/constants';
import { NgbAccordion, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { BehaviorSubject, lastValueFrom, Subscription } from 'rxjs';
import swal from 'sweetalert2';
import * as Constants from '@constants/constants';
import Swal from 'sweetalert2';
import moment from 'moment';
import { LeadDocumentsComponent } from '../lead-documents/lead-documents.component';
import { DndDropEvent } from 'ngx-drag-drop';
import { LeadUpdatesComponent } from '../lead-updates/lead-updates.component';
import { LeadCreateLenderOfferListComponent } from '../lead-create-lender-offer-list/lead-create-lender-offer-list.component';
import { LeadSubmissionComponent } from '../lead-submission/lead-submission.component';
import { LeadSubmissionUpdatesComponent } from '../lead-submission-updates/lead-submission-updates.component';
import { ExcelService } from '@services/excel.service';
import FileSaver from 'file-saver';
import { ExclusivityService } from '@services/exclusivity.service';
import { ToastrService } from 'ngx-toastr';

export const STEP = {
    SEND_App_email: 'email',
    TIME_DELAY: 'time-delay',
    SET_PROPERTY_VALUE: 'set-property-value',
    TRIGGER: 'trigger'
}
@Component({
    selector: 'app-lead-detail',
    templateUrl: './lead-detail.component.html',
    styleUrls: ['./lead-detail.component.scss']
})
export class LeadDetailComponent implements OnInit, OnDestroy {
    subsc!: Subscription;
    leadID: string = '';
    activeTab: string = '';
    lead: any = {};
    role = Roles;
    userRole: string = '';
    modal!: NgbModalRef;
    sendSmsmodal!: NgbModalRef;
    notes: any[] = [];
    bussinessInfoForm!: FormGroup;
    declineForm!: FormGroup;
    lenderdeclineForm!: FormGroup;
    expCreditScore: any = {};
    statesList: any[] = [];
    mask = Mask;
    @ViewChild('acc', { static: false }) accordion!: NgbAccordion;
    @ViewChild('accord', { static: false }) accord!: NgbAccordion;
    @ViewChild('crmaccord', { static: false }) crmaccord!: NgbAccordion;
    @ViewChild('sendSubmiision', { static: false }) sendSubmiision!: NgbAccordion;
    @ViewChild('relatedacc', { static: false }) relatedacc!: NgbAccordion;
    @ViewChild('notesacc', { static: false }) notesacc!: NgbAccordion;
    @ViewChild('updatesacc', { static: false }) updatesacc!: NgbAccordion;
    @ViewChild('lenderacc', { static: false }) lenderacc!: NgbAccordion;
    @ViewChild('submissionupdatesacc', { static: false }) submissionupdatesacc!: NgbAccordion;
    isLeadDeclined: boolean = true;
    isLeadWithdrawn: boolean = true;
    isaddCommission: boolean = true;
    canDeclineLead: boolean = false;
    canCreateContract: boolean = false;
    canWithdrawLead: boolean = false;
    canSendSubmission: boolean = false;
    canSearchDataMerch: boolean = false;
    canGetExCreditScore: boolean = false;
    canCreateApplication: boolean = false;
    canGetExBussScore: boolean = false;
    canFU: boolean = false;
    canTakeInterview: boolean = false;
    canCreateLenderOffer: boolean = false;
    canViewLeadUpdate: boolean = false;
    canViewLeadSubmissionUpdate: boolean = false;
    canActivityList: boolean = false;
    canListNotes: boolean = false;
    canViewCalendar: boolean = false;
    canPreviewFCS: boolean = false;
    canSaveFCS: boolean = false;
    canListDocuments: boolean = false;
    canTakeWelcomeCall: boolean = false;
    canViewFundDetails: boolean = false;
    canEditLead: boolean = false;
    cantakeMerchantInterview: boolean = false;
    cantakeLandlordInterview: boolean = false;
    canViewBankDetails: boolean = false;
    interviewDocuments: Array<any> = [];
    lanloardUrl: string = '';
    merchantUrl: string = '';
    canViewLead: boolean = false;
    roles = Constants.Roles;
    downloadWithIpCheckbox: boolean = false;
    canViewSendAppEmail: boolean = false;
    canViewSignedApplication: boolean = false;
    canViewNotifyToSubmissions: boolean = false;
    canViewSendSms: boolean = false;
    canViewPurposeSubmission: boolean = false;
    lendersList: Array<any> = [];
    showPaperPlane: boolean = false;
    canfundRecord: boolean = false;
    canViewLenderOffers: boolean = false;
    canAddCommission: boolean = false;
    canViewRelatedDeals: boolean = false;
    dateFormat: string = '';
    timeZone: string = '';
    page: number = 1;
    limit: number = 10;
    total: number = 0;
    hasMoreUsers: boolean = false;
    leadSourceList: Array<any> = [];
    relatedDealsList: Array<any> = [];
    leadStatusList: Array<any> = [];
    LeadStatus: string = '';
    LeadSource: string = '';
    LeadType: number = 0;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    checkBoxColor: boolean = false;
    @ViewChild('rejectOffer') rejectOffer!: ElementRef;
    @ViewChild('lenderrejectOffer') lenderrejectOffer!: ElementRef;
    @ViewChild('submittedDealsLender') submittedDealsLender!: ElementRef;
    lenderID: string = ''
    @ViewChild(LeadDocumentsComponent) child!: LeadDocumentsComponent;
    @ViewChild(LeadCreateLenderOfferListComponent) submittedDealsLenderofferUpdate!: LeadCreateLenderOfferListComponent;
    @ViewChild(LeadSubmissionComponent) leadSubmissionDocumentList!: LeadSubmissionComponent;
    companyType: string = '';
    crmUtilities: any = {};
    crmUtilitiesAddCommission: boolean = false;
    crmUtilitiesCheckDataMerch: boolean = false;
    crmUtilitiesCreateApplication: boolean = false;
    crmUtilitiesCreateContract: boolean = false;
    crmUtilitiesLenderOffer: boolean = false;
    crmUtilitiesDealParticipants: boolean = false;
    crmUtilitiesDownloadWithIp: boolean = false;
    crmUtilitiesExperianBussinessScore: boolean = false;
    crmUtilitiesInterview: boolean = false;
    crmUtilitiesExperianCreditReport: boolean = false;
    crmUtilitiesFinalUnderwriting: boolean = false;
    crmUtilitiesFundingRecord: boolean = false;
    crmUtilitiesNotifyToSubmissions: boolean = false;
    crmUtilitiesSendAppandEmail: boolean = false;
    crmUtilitiesPrefundRecords: boolean = false;
    crmUtilitiesProposeSubmission: boolean = false;
    crmUtilitiesSendSms: boolean = false;
    crmUtilitiesWelcomeCall: boolean = false;
    crmUtilitiesSignedApplication: boolean = false;
    crmUtilitiesSendSubmission: boolean = false;
    crmUtilityArrayresult: boolean = true;
    crmUtilitiesWithdraw: boolean = false;
    crmUtilitiesOnHold: boolean = false;
    crmUtilitiesWebhookCentrex: boolean = false;
    crmUtilitiesSteps: Array<any> = [];
    dragIndex!: number;
    replaceIndex!: number;
    dragedItem: any[''];
    EffectAllowed: any = 'all';
    AssignedTo: any;
    draggable = {
        // note that data is handled with JSON.stringify/JSON.parse
        // only set simple data or POJO's as methods will be lost 
        data: {},
        //   this.campaignData
        effectAllowed: this.EffectAllowed,
        disable: false,
        handle: false
    };
    crmUtilitiesName: string = '';
    dragDropCrmUtilities: boolean = false
    @ViewChild(LeadUpdatesComponent) leadUpdateLogs!: LeadUpdatesComponent;
    @ViewChild(LeadSubmissionUpdatesComponent) leadSubmissionUpdateLogs!: LeadSubmissionUpdatesComponent;
    userDetails: any = {};
    submittedDealslenderofferId: string = '';
    ISO: string = '';
    submittedDealsLenderForm!: FormGroup;
    submittedDealslenderId: string = '';
    submittedDealsType: string = 'accept';
    submittedLenderList: Array<any> = [];
    responseSubmitted: string = '';
    isoList: Array<any> = [];
    Closer: string = '';
    closerList: Array<any> = [];
    holdForm!: FormGroup;
    @ViewChild('FCS', { static: false }) FcsModelVariable!: ElementRef;
    fundedCompanyTrue: boolean = false;
    LenderDeclineId: string = '';
    canExclusivePeriod: boolean = false;
    @ViewChild(LeadDocumentsComponent) docuemntUpdateLeadDetail!: LeadDocumentsComponent;
    exclusivePeriodForm!: FormGroup;
    getExclusiveStatus: string = ''
    excluisveTimeValue: string | number = '';
    leadAssignedTo: string = ''
    assigedList: Array<any> = []
    getFCSUrl: string = ''
    canFCS: boolean = false;
    canCreateLenderofr: boolean = false;
    leadstatusPermission: any = {}
    crmUtilityDealParticipant: boolean = false;
    removeExclusivity: boolean = false;
    fetchedDataEx: any;
    exclusive!: TemplateRef<any>;
    fetchedData!: any;
    originalExValue: any;
    isAddExcluisve:boolean =false;
    isExclusiveLead:boolean = false;
    canAddExclusivity:boolean = false;
    canRemoveExclusivity:boolean = false;

    constructor(
        private route: ActivatedRoute,
        private commonService: CommonService,
        private apiService: ApiService,
        private authService: AuthService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private excel: ExcelService,
        private exclusiveService: ExclusivityService,
        private toastr: ToastrService
    ) {

    }

    ngOnInit(): void {
        this.permissionsUpdate();
        this.getUserDetails();
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLeadDetailsList();
            this.getlendersList();
            this.getLeadOptions();
            this.getAssignedOptions();
            this.getAssignedToList();

        } else {
            this.commonService.showError('');
        }
        this.getRelatedDealsList();
        if (this.canViewLenderOffers) {

            this.activeTab = 'Lender Offers'
        } else if (this.canViewLeadUpdate) {
            this.activeTab = 'Updates'
        } else if (this.canActivityList) {
            this.activeTab = 'activities'
        } else if (this.canListDocuments) {
            this.activeTab = 'Documents'
        } else if (this.canViewCalendar) {
            this.activeTab = 'Calender'
        } else if (this.canListNotes) {
            this.activeTab = 'Notes'
        } else if (this.canSaveFCS) {
            this.activeTab = 'FCS'
        } else if (this.canPreviewFCS) {
            this.activeTab = 'Fcs Details'
        } else if (this.canSendSubmission) {
            this.activeTab = 'Send Submission'
        } else if (this.cantakeMerchantInterview || this.cantakeLandlordInterview) {
            this.activeTab = 'InterviewURLS'
        } else if (this.canViewBankDetails) {
            this.activeTab = 'Bank Information'
        } else if (this.canListDocuments) {
            this.activeTab = 'Documents'
        }
        this.subsc = this.route.queryParams.subscribe((val: any) => {
            if (val.activeTab) {
                this.activeTab = val.activeTab;
                // console.log('tabbb', this.activeTab);


            }
        });
        if (params && params['activeTab']) {
            let data = params['activeTab'];
            // console.log(data, 'data');

        }
        this.initDeclineForm();
        this.initLenderDeclineForm();
        //this.fetchDataFromService();
        this.fetchDatafromLocalStorage();

    }
    ngAfterViewInit() {
        if (this.FcsModelVariable && this.activeTab == 'FCS') {
            this.openLeadFcs(this.FcsModelVariable)
        }
    }
    // removeExclusive() {
    //     this.removeExclusivity = true;
    //     this.lead.is_freeze = 0;
    //     this.sendDataforExclusivity(this.lead.is_freeze, this.removeExclusivity);
    //     this.showToastforExRemove();
    //     this.closeExModal();
    // }
    sendDataforExclusivity(data: boolean, originalValue: boolean) {
        this.lead.is_freeze = data;
        this.exclusiveService.send(this.lead.is_freeze, originalValue);
    }
    // backtoExclusive() {

    //     this.removeExclusivity = false;
    //     this.lead.is_freeze = 1;
    //     this.sendDataforExclusivity(this.lead.is_freeze, this.removeExclusivity);
    //     this.showToastforExAdd();
    //     this.closeExModal();
    // }
    openExModal() {
        document.getElementById('yourModal')?.classList.add('show');
    }
    closeExModal() {
        document.getElementById('yourModal')?.classList.remove('show');
    }
    showToastforExRemove() {
        this.toastr.success('Exclusivity Removed Successfully', 'Success');
    }
    showToastforExAdd() {
        this.toastr.success('Exclusivity Added Successfully', 'Success');
    }
    fetchDatafromLocalStorage() {

        // this.fetchedData = this.exclusiveService?.getDataSubject();
        // if (this.fetchedData == 0) {
        //     this.removeExclusivity = true;
        // }
        // else {
        //     this.removeExclusivity = false;
        // }
    }
    permissionsUpdate() {
        this.canViewLead = this.authService.hasPermission('lead-view');
        this.canEditLead = this.authService.hasPermission('lead-edit');
        this.cantakeMerchantInterview = this.authService.hasPermission('lead-merchant-interview');
        this.cantakeLandlordInterview = this.authService.hasPermission('lead-landlord-interview');
        this.canDeclineLead = this.authService.hasPermission('lead-decline');
        this.canViewCalendar = this.authService.hasPermission('lead-calendar-list');
        this.canActivityList = this.authService.hasPermission('lead-activity-list');
        this.canListNotes = this.authService.hasPermission('lead-note-list');
        this.canPreviewFCS = this.authService.hasPermission('fcs-preview');
        this.canSaveFCS = this.authService.hasPermission('fcs-save');
        this.canTakeWelcomeCall = this.authService.hasPermission('lead-welcome-call');
        this.canListDocuments = this.authService.hasPermission('lead-document-list');
        this.canWithdrawLead = this.authService.hasPermission('lead-withdraw');
        this.canSendSubmission = this.authService.hasPermission('lead-submission');
        this.canCreateContract = this.authService.hasPermission('lead-contract');
        this.canSearchDataMerch = this.authService.hasPermission('data-merch-search');
        this.canCreateApplication = this.authService.hasPermission('lead-create-application');
        this.canGetExBussScore = this.authService.hasPermission('business-score');
        this.canGetExCreditScore = this.authService.hasPermission('credit-score');
        this.canFU = this.authService.hasPermission('lead-final-underwriting');
        this.canTakeInterview = this.authService.hasPermission('lead-landlord-interview');
        this.canCreateLenderOffer = this.authService.hasPermission('lender-offer-create');
        this.canViewFundDetails = this.authService.hasPermission('participant-create');
        this.canViewLeadUpdate = this.authService.hasPermission('lead-updates');
        this.canViewSendAppEmail = this.authService.hasPermission('send-app-and-email');
        this.canViewBankDetails = this.authService.hasPermission('bank-detail-view');
        this.canViewSignedApplication = this.authService.hasPermission('signed-application');
        this.canViewNotifyToSubmissions = this.authService.hasPermission('notify-to-submissions');
        this.canViewSendSms = this.authService.hasPermission('send-sms');
        this.canViewPurposeSubmission = this.authService.hasPermission('propose-submission');
        this.canViewRelatedDeals = this.authService.hasPermission('related-deals');
        this.canfundRecord = this.authService.hasPermission('lead-fund-record');
        this.canAddCommission = this.authService.hasPermission('add-commission');
        this.canViewLenderOffers = this.authService.hasPermission('lender-offer-list');
        this.dragDropCrmUtilities = this.authService.hasPermission('drag-drop-crm-utilities');
        this.canViewLeadSubmissionUpdate = this.authService.hasPermission('submission-updates');
        this.canExclusivePeriod = this.authService.hasPermission('exclusive-period');
        this.canFCS = this.authService.hasPermission('FCS');
        this.canRemoveExclusivity = this.authService.hasPermission('exclusive-period-remove');
        // this.canAddExclusivity = this.authService.hasPermission('FCS');
    }


    sendEmail(email: any) {
        localStorage.setItem('sendAppEmail', email);
        this.router.navigate([`/${this.userBaseRoute}/send-email-app/` + this.leadID]);
    }

    async getlendersList() {
        try {
            // 'propose', 'submission'
            const res$ = this.apiService.postReq(API_PATH.SUBMITTED_DEALS_LENDER_LIST, { lead_id: this.leadID }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.lendersList = response.data;
                this.lendersList.forEach(object => {
                    object.toggle = false
                });
                for (let i = 0; i < this.lendersList.length; i++) {
                    if (this.lendersList[i].status == 1 || this.lendersList[i].status == 3) {
                        this.lendersList[i].toggle = true;
                    } else {
                        this.lendersList[i].toggle = false;
                    }
                }


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
    async getLeadOptions() {
        try {
            let url = '';
            if (this.userRole == Roles.ADMINISTRATOR) {
                url = `?lead_id=${this.leadID}`;
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST + url, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                if (this.userDetails?.company_type == 'broker') {
                    this.leadSourceList = response.data.lead_source;
                } else {
                    this.leadSourceList = response.data.iso;
                }
                this.isoList = response.data.iso;
                this.leadSourceList.sort((a, b) => a.name.localeCompare(b.name))
                this.leadStatusList = response.data.status;
                this.leadStatusList.sort((a, b) => a.name.localeCompare(b.name))
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
    async getRelatedDealsList() {
        try {
            let url = `?&page_limit=${this.limit}&page=${this.page}&lead_id=${this.leadID}`;
            this.commonService.showSpinner();
            let res$ = this.apiService.getReq(API_PATH.RELATED_DEALS + url, 'related', 'deals');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data.data) {
                    this.relatedDealsList = response.data.data;
                    var a = this.relatedDealsList[0];
                    this.AssignedTo = a?.assigned_to;
                    this.total = response.data.total
                } else {
                    this.relatedDealsList = [];
                    this.total = 0;
                    this.page = 1;
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
     * @description on page change
     * @returns {void}
     * @param p 
     */
    onPageChange(p: number): void {
        this.page = p;
        this.getRelatedDealsList();
    }

    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
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
                this.companyType = ud?.company_type;
                if (this.companyType == 'funded') {
                    this.fundedCompanyTrue = true;
                } else {
                    this.fundedCompanyTrue = false;
                }
                this.crmUtilities = ud?.crm_utilties;
                // console.log("crmUtilities", this.crmUtilities)
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

    getDate(date: any) {
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }
    getBussinessDate(date: any) {
        if (date) {
            return moment(date).format(`${this.dateFormat}`)
        } else {
            return ''
        }


    }

    async changeLeadStatus(id: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_DETAIL_LEAD_STATUS_UPDATE, { lead_id: this.leadID, lead_status: this.LeadStatus }, 'lead', 'updates');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.getLeadDetailsList();
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
    async changeLeadSource(id: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_DETAIL_LEAD_SOURCE_UPDATE, { lead_id: this.leadID, lead_source: this.LeadSource, type: this.lead?.company_type == 'broker' ? 'Lead Source' : 'ISO' }, 'lead', 'updates');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                //   this.getLeadDetailsList();
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
    async changeIso(id: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_DETAIL_ISO_UPDATE, { lead_id: this.leadID, lead_iso: this.ISO }, 'lead', 'updates');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                //   this.getLeadDetailsList();
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
    async changeCloser(id: string) {
        try {
            this.commonService.showSpinner();
            if (this.Closer != '' || this.leadAssignedTo != '') {
                if (this.Closer == this.leadAssignedTo) {
                    Swal.fire({
                        title: 'Please update, assigned to & closer should not be same',
                        icon: 'warning',
                        showCancelButton: false,
                        confirmButtonText: ' Ok',
                        confirmButtonColor: this.color,
                        cancelButtonText: 'Cancel'
                    })
                    setTimeout(() => this.Closer = this.lead?.lead_closer, 0);
                    this.commonService.hideSpinner();
                    return;
                }
            }
            const res$ = this.apiService.postReq(API_PATH.LEAD_DETAIL_CLOSER_UPDATE, { lead_id: this.leadID, closer: this.Closer }, 'lead', 'updates');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                //   this.getLeadDetailsList();
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

    async changeLeadType() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_DETAIL_LEAD_TYPE_UPDATE, { lead_id: this.leadID, lead_type: Number(this.LeadType) }, 'lead', 'updates');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.getLeadDetailsList();
                this.docuemntUpdateLeadDetail?.getLeadDetailsList();
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
     * @description on Click of create application
     */
    async createApplication(): Promise<void> {
        try {
            let createwithIP = '/create-app';
            const res$ = this.apiService.getReq(API_PATH.EXPORT_PDF + `${this.leadID}` + `${createwithIP}`, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                window.open(response.data, "_blank");
                //handle response here
                this.child?.getDocumentListUpdate();
                this.leadSubmissionDocumentList?.getDocsAndCompany();
                this.leadUpdateLogs?.getLeadUpdates();
                this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
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
    async getLeadDetailsList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_DETAILS + this.leadID, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lead = response.data;
                // console.log('this.lead ',this.lead );
                this.isExclusiveLead = (this.lead?.is_duplicate || this.lead?.is_original)?true:false             
                this.originalExValue = this.lead.is_freeze;
                this.excluisveTimeValue = this.lead?.time_period;
                this.LeadStatus = this.lead?.lead_status_id;
                this.LeadSource = this.lead?.lead_source_id;
                this.ISO = this.lead?.lead_iso;
                this.Closer = this.lead?.lead_closer;
                this.LeadType = this.lead?.lead_type;
                this.merchantUrl = this.lead.merchant_interview_room;
                this.lanloardUrl = this.lead.landlord_interview_room;
                this.interviewDocuments = this.lead.interview_documents;
                this.isLeadDeclined = this.lead.is_lead_declined ? true : false;
                this.crmUtilitiesSteps = this.lead.order;
                this.leadAssignedTo = this.lead?.assigned_to;
                this.isAddExcluisve = this.lead?.add_exclusivity;
               
                
                
                if (response.data.is_freeze == 1) {
                    this.loadExData();
                }
                if (this.lead.lead_status == 'Submitted') {
                    this.getlendersList();
                }
                this.crmUtilityArrayresult = Array.isArray(this.crmUtilities);
                // console.log("crmUtilityArrayresult", this.crmUtilityArrayresult)
                if (this.crmUtilityArrayresult) {
                }
                else {
                    var permissions = this.crmUtilities[this.lead.lead_status];
                    this.leadstatusPermission = permissions;
                    if (permissions) {
                        this.crmUtilitiesCheckDataMerch = permissions.check_data_merch;
                        this.crmUtilitiesAddCommission = permissions.add_commission;
                        this.crmUtilitiesCreateApplication = permissions.create_application;
                        this.crmUtilitiesLenderOffer = permissions.create_lender_offer;
                        this.crmUtilitiesCreateContract = permissions.create_contract;
                        this.crmUtilitiesExperianBussinessScore = permissions.experian_business_score;
                        this.crmUtilitiesDealParticipants = permissions.deal_participants;
                        this.crmUtilitiesFundingRecord = permissions.funding_record;
                        this.crmUtilitiesFinalUnderwriting = permissions.final_underwriting;
                        this.crmUtilitiesDownloadWithIp = permissions.download_with_ip;
                        this.crmUtilitiesExperianCreditReport = permissions.experian_credit_report;
                        this.crmUtilitiesNotifyToSubmissions = permissions.notify_to_submissions;
                        this.crmUtilitiesInterview = permissions.interview;
                        this.crmUtilitiesSendSms = permissions.send_sms;
                        this.crmUtilitiesPrefundRecords = permissions.pre_fund_records;
                        this.crmUtilitiesSendAppandEmail = permissions.send_app_and_email;
                        this.crmUtilitiesProposeSubmission = permissions.propose_submission;
                        this.crmUtilitiesSignedApplication = permissions.signed_application;
                        this.crmUtilitiesSendSubmission = permissions.send_submission;
                        this.crmUtilitiesWelcomeCall = permissions.welcome_call;
                        this.crmUtilitiesWithdraw = permissions.withdraw;
                        this.crmUtilitiesOnHold = permissions.on_hold;
                        this.crmUtilitiesWebhookCentrex = permissions.webhook_centrex;
                        this.crmUtilityDealParticipant = permissions?.deal_participants
                        // this.canFCS = permissions?.fcs
                        this.canCreateLenderofr = permissions?.create_lender_offer

                    }

                }


                // var index = this.crmUtilities.indexOf(this.lead.lead_status);
                // if(!result){
                //     var permissions = permissions;
                //     console.log("if", permissions);
                // } 
               

            }
            // this.lead.is_freeze = 0;
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
    check(lender: any) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to accept the offer from lender' + ' - ' + lender.name + '?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: this.color,
        }).then((result) => {
            if (result.value) {
                this.lenderOfferExists(lender.id, 'accept');

                // this.updateLenderOfferStatus(lender.id, 2, 1, '', 'accept');
                // this.getLeadDetailsList();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
            }
        })
    }


    /**
 * @description on Click of create application
 */
    async signedApplication(): Promise<void> {
        try {
            let withIP = '';
            let owner1Date = '';
            let owner2Date = '';
            let date = new Date();
            // if (this.lead.sign_date) {
            //     if(this.companyType == 'broker'){
            //         owner1Date = moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
            //     }else{
            //         owner1Date = moment(this.lead.sign_date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
            //     }

            // }
            // if (this.lead.other_customer_sign_date) {
            //     if(this.companyType == 'broker'){
            //         owner2Date = moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
            //     }else{
            //         owner2Date = moment(this.lead.other_customer_sign_date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
            //     }
            // }
            if (this.lead.sign_date) {
                owner1Date = moment(this.lead.sign_date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
            }
            if (this.lead.other_customer_sign_date) {
                owner2Date = moment(this.lead.other_customer_sign_date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
            }

            let url = `?sign_date=${owner1Date}&other_customer_sign_date=${owner2Date}`;
            this.commonService.showSpinner();
            if (this.downloadWithIpCheckbox) {
                withIP = '/with-ip';
            }
            const res$ = this.apiService.getReq(API_PATH.EXPORT_PDF + `${this.leadID}` + `${withIP}` + url, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                window.open(response.data, "_blank");
                //handle response here
                this.child?.getDocumentListUpdate();
                this.leadUpdateLogs?.getLeadUpdates();
                this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
                this.leadSubmissionDocumentList?.getDocsAndCompany();
                this.getLeadDetailsList();
                this.downloadWithIpCheckbox = false;

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
    toggle(ID: string) {
        setTimeout(() => this.accordion.toggle(ID), 0);
    }
    toggleLeadsummary(ID: string) {
        setTimeout(() => this.accord.toggle(ID), 0);

    }
    toggleRelatedDeals(ID: string) {
        setTimeout(() => this.relatedacc.toggle(ID), 0);
    }
    toggleNotes(ID: string) {
        setTimeout(() => this.notesacc.toggle(ID), 0);
    }
    toggleUpdates(ID: string) {
        setTimeout(() => this.updatesacc.toggle(ID), 0);
    }
    toggleSubmissionUpdates(ID: string) {
        setTimeout(() => this.submissionupdatesacc.toggle(ID), 0);
    }
    toggleLender(ID: string) {
        setTimeout(() => this.lenderacc.toggle(ID), 0);
    }
    toggleCrmUtilities(ID: string) {
        setTimeout(() => this.crmaccord.toggle(ID), 0);
    }
    toggleSendsubmission(ID: string) {
        setTimeout(() => this.sendSubmiision.toggle(ID), 0);
    }
    async onNotifySubmission() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_NOTIFY, { lead_id: this.leadID }, 'notify', 'to-submissions');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.getLeadDetailsList();
                this.leadUpdateLogs?.getLeadUpdates();
                this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
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


    async checkDataMerch(templateRef: TemplateRef<any>) {
        try {

            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DATA_MERCH, { lead_id: this.leadID }, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.notes = response.data.notes;
                if (this.notes && this.notes.length) {
                    this.openModal(templateRef);
                } else {
                    this.commonService.showError('No records found.');
                }
                this.leadUpdateLogs?.getLeadUpdates();
                this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();

            } else {
                this.commonService.showError(response.message)
            }
            this.commonService.hideSpinner();


        } catch (error: any) {
            this.commonService.hideSpinner();
            this.leadUpdateLogs?.getLeadUpdates();
            this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }

    checkExperianCreditPopup(templateRef: TemplateRef<any>) {
        swal.fire({
            title: 'Data will be verified by experian credit report',
            imageUrl: './assets/images/Experian_logo.svg',
            imageHeight: 100,
            confirmButtonText: 'Ok',
            confirmButtonColor: this.color,
            showCancelButton: true,
            backdrop: true,
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                this.experianCreditScore(templateRef);
            }
        })

    }
    async experianCreditScore(templateRef: TemplateRef<any>) {
        try {

            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.EXPERIAN_CREDIT_SCORE, { lead_id: this.leadID }, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.expCreditScore = response.data;
                if (this.expCreditScore && (this.expCreditScore.commercialScore || this.expCreditScore.fsrScore)) {
                    this.openModal(templateRef);
                } else {
                    this.commonService.showError('No score found.');
                }
            } else {
                this.commonService.showError(response.message)
            }
            this.leadUpdateLogs?.getLeadUpdates();
            this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
            this.commonService.hideSpinner();

        } catch (error: any) {
            this.leadUpdateLogs?.getLeadUpdates();
            this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }

    /**
     * @description init officer form
     */
    initExperianBussForm() {
        this.bussinessInfoForm = this.fb.group({
            scoreType: [['commercialScore', 'fsrScore'], [Validators.required]],
            leadName: [`${this.lead.first_name} ${this.lead.last_name}`, [Validators.pattern(Custom_Regex.spaces), Validators.maxLength(100),
                // Validators.minLength(3)
            ]],
            address: [this.lead?.lead_address, [Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(200),
                // Validators.minLength(3)
            ]],
            address2: [this.lead?.lead_other_address, [Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), Validators.maxLength(200),
                // Validators.minLength(3)
            ]],
            state: [this.lead.encrypted_state_id, [Validators.required]],
            city: [this.lead?.lead_city, [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.city), Validators.pattern(Custom_Regex.name),
                //  Validators.minLength(3)
            ]],
            zip: [this.lead?.lead_zip, [Validators.pattern(Custom_Regex.digitsOnly),]],
            federalTaxId: [this.lead?.lead_federal_tax_id, [Validators.pattern(Custom_Regex.spaces)]],
            phone: [this.lead?.phone_number, [Validators.required]]
        })
    }
    /**
    * @description check data merch
    */
    checkDataMerchPopup(templateRef: TemplateRef<any>) {
        swal.fire({
            title: 'Data will be verified by data merch',
            imageUrl: './assets/images/data-merch.png',
            imageHeight: 40,
            confirmButtonText: 'Ok',
            confirmButtonColor: this.color,
            showCancelButton: true,
            backdrop: true,
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                this.checkDataMerch(templateRef);
            }
        })

    }

    /**
    * @description get lead detail form controls
    */
    get bif(): { [key: string]: AbstractControl } {
        return this.bussinessInfoForm.controls;
    }


    async experianBussReport(templateRef: TemplateRef<any>) {
        this.getStates(this.lead.encrypted_country_id);
        this.initExperianBussForm();
        this.openModal(templateRef);
    }
    checkExperianBussinessPopup(templateRef: TemplateRef<any>) {
        swal.fire({
            title: 'Data will be verified by experian bussiness score',
            imageUrl: './assets/images/Experian_logo.svg',
            imageHeight: 100,
            confirmButtonText: 'Ok',
            confirmButtonColor: this.color,
            showCancelButton: true,
            backdrop: true,
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                this.experianBussSubmit(templateRef);
            }
        })

    }
    async experianBussSubmit(templateRef: TemplateRef<any>) {
        try {
            this.bussinessInfoForm.markAllAsTouched();
            if (this.bussinessInfoForm.valid) {
                this.commonService.showSpinner();
                let data = {
                    name: this.bussinessInfoForm.value.leadName,
                    city: this.bussinessInfoForm.value.city,
                    state_id: this.bussinessInfoForm.value.state,
                    physical_address_1: this.bussinessInfoForm.value.address,
                    physical_address_2: this.bussinessInfoForm.value.address2,
                    scoreType: this.bussinessInfoForm.value.scoreType,
                    lead_id: this.leadID
                }
                const res$ = this.apiService.postReq(API_PATH.EXPERIAN_BUSS_SCORE, data, 'lead', 'view');
                const response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.closeModal();
                    this.expCreditScore = response.data;
                    if (this.expCreditScore && (this.expCreditScore.commercialScore || this.expCreditScore.fsrScore)) {
                        this.openModal(templateRef);
                    } else {
                        this.commonService.showError('No score found.');
                    }

                } else {
                    this.commonService.showError(response.message);
                }
                this.leadUpdateLogs?.getLeadUpdates();
                this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
                this.commonService.hideSpinner();
            }

        } catch (error: any) {
            this.leadUpdateLogs?.getLeadUpdates();
            this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }


    /**
     * @description get states list
     * @param country_id 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async getStates(country_id: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
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
    onchangeIp(event: any) {
        this.downloadWithIpCheckbox = event.target.checked;
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
                // if(this.companyType == 'broker'){
                //     this.router.navigate([`/${this.userBaseRoute}/lead-createlenderoffer/` + this.leadID], { queryParams: { lender: lenderID } });
                // }

                // this.getLeadDetailsList();
                this.leadUpdateLogs?.getLeadUpdates();
                this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
                input.checked = 0;
                // this.checkBoxColor = false;
                this.lendersList[i].toggle = false

            }
        })
    }
    //modal
    openModalDecline(templateRef: any) {
        // this.closeTriggerModal();
        // this.emailTemplateId = id
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
            //   this.inintColorForm();
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    closeDeclineModal() {
        this.modal.close();
    }
    //modal
    openSubmittedDeals(templateRef: any, lenderId: any) {
        this.submittedDealslenderId = lenderId;
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'lg' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    closeSubmittedDealsModal() {
        this.modal.close();
    }
    //
    get f(): { [key: string]: AbstractControl } {
        return this.declineForm.controls;
    }
    initDeclineForm() {
        this.declineForm = this.fb.group({
            reason_note: ['', [Validators.required]]
        })
    }
    get d(): { [key: string]: AbstractControl } {
        return this.lenderdeclineForm.controls;
    }
    initLenderDeclineForm() {
        this.lenderdeclineForm = this.fb.group({
            reason_note: ['', [Validators.required]]
        })
    }
    initSubmittedDealsForm() {
        this.submittedDealsLenderForm = this.fb.group({
            lender_id: ['', [Validators.required]]
        })
    }
    get s(): { [key: string]: AbstractControl } {
        return this.submittedDealsLenderForm.controls;
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
                //  this.lenderOfferExists(lenderID, 'reject');
                if (this.companyType == 'broker') {
                    this.lenderOfferRejectExists(lenderID, 'reject');
                } else {
                    this.lenderOfferExists(lenderID, 'reject');
                }

                // this.initDeclineForm();
                // this.openModalDecline(this.rejectOffer);
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

    /**
     * 
     * @param lenderID 
     * @param status_type 1 for response from lender, 2 for order acceptence for that lender
     * @param status 
     */
    async updateLenderOfferStatus(lenderID: string, status_type: number, status: number, input: any = null, type: any) {
        // console.log(lenderID,'<--id',status_type,'-<statustype',status,'--<status',input,'--<input',type,'--<type');

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
                    lender_offer_id: this.submittedDealslenderofferId,

                }
            } else {
                data = {
                    lead_id: this.leadID,
                    lender_id: lenderID,
                    status_type: status_type,
                    status: status,
                    other_confirmation: status,
                    decline_reason: this.declineForm.value.reason_note,
                    lender_offer_id: this.submittedDealslenderofferId,
                    lender_decline_reason: this.lenderdeclineForm.value.reason_note,

                }
            }
            const res$ = this.apiService.postReq(API_PATH.UPDATE_LENDER_OFFER_STATUS, data, 'lead', 'submission');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.submittedDealsLenderofferUpdate?.getLenderOfferList();
                this.submittedDealsLenderofferUpdate?.getDeclinedOfferList();
                if (this.companyType != 'broker') {
                    if (this.canViewLenderOffers && this.lead.can_lender_offer_list) {
                        this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                        this.activeTab = 'Lender Offers';

                    } else {
                        this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                        this.activeTab = 'Documents';

                    }
                }
                if (type != 'accept' && this.companyType == 'broker') {
                    if (this.canViewLenderOffers && this.lead.can_lender_offer_list) {
                        this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                        this.activeTab = 'Lender Offers';

                    } else {
                        this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                        this.activeTab = 'Documents'

                    }
                }
                else if (type == 'accept' && this.companyType == 'broker' && status_type == 1 && status == 1) {
                    this.router.navigate([`/${this.userBaseRoute}/lead-createlenderoffer/` + this.leadID], { queryParams: { lender: lenderID } });


                }
                // this.activeTab = 'Documents'
                // if (status_type == 3) {
                //     this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                //     this.activeTab = 'Lender Offers'
                // } else {
                //     this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                //     this.activeTab = 'Documents'
                // }

                this.getlendersList();
                this.leadUpdateLogs?.getLeadUpdates();
                this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
            } else {
                this.commonService.showError(response.message);
                if (input)
                    input.checked = 0;
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            if (input)
                input.checked = 0;
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    loadExData() {
        // this.exclusiveService.getData().subscribe((result) => {
        //     this.dataEx = result;
        //     
        //     this.lead.is_freeze  = this.fetchedData;
        // });
        // this.fetchedDataEx = this.exclusiveService.getDataSubject();
        // this.lead.is_freeze = this.fetchedDataEx;
    }
    openModal(templateRef: TemplateRef<any>) {

        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'xl' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    closeModal() {
        this.modal.close();
    }
    leadDocument() {
        this.lead.lead_status = 'Docs In'
        this.getLeadDetailsList();
        this.leadUpdateLogs?.getLeadUpdates();
        this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
    }

    leadDeclined() {
        this.isLeadDeclined = true;
        this.lead.lead_status = 'Declined'
        this.closeModal();
        this.getLeadDetailsList();
    }

    declineLeadModal(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static' });
        } catch (error) {
            this.commonService.showErrorMessage(error);
        }
    }




    withdrawLead(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    leadFcsSubmit() {
        this.leadUpdateLogs?.getLeadUpdates();
        this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
        this.getLeadDetailsList();
        this.closeLeadFcsModal();
        this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
        this.activeTab = 'Documents'

    }

    leadWithdrawed() {
        this.isLeadWithdrawn = true;
        this.lead.lead_status = 'Withdrawn';
        this.closeModal();
        this.getLeadDetailsList();
        this.leadUpdateLogs?.getLeadUpdates();
        this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
    }
    addCommisionLead(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'xl' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    leadAddcommision() {
        this.isaddCommission = true;
        this.closeModal();
    }

    scrollToTabs(el: HTMLElement, value: any) {
        if (value) {
            this.activeTab = value;
        }
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }
    scroll(id: any) {
        let el: any = document.getElementById(id);
        if (el) {
            el.scrollIntoView();
        }
    }


    leadDetailsLink(id: any) {
        const url = this.router.serializeUrl(this.router.createUrlTree([`/${this.userBaseRoute}/lead-detail/${id}`]));
        window.open(url, '_blank')
    }
    getUpdateLeadStatus(value: any) {
        this.getLeadDetailsList();
        this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
        this.leadUpdateLogs?.getLeadUpdates();
        this.getlendersList();
    }

    onDragover(event: DragEvent, i: any) {
        this.replaceIndex = i;
        // console.log("dragover", JSON.stringify(event, null, 2));
    }

    onDrop(event: DndDropEvent, list: any[]) {
    }
    onDraggableMoved(event: DragEvent, item: any, list: any[], effect: any, i: number) {
    }

    onDragStart(event: DragEvent, i: any, item: any[],) {
        if (this.dragDropCrmUtilities) {
            this.dragIndex = i
            this.dragedItem = item
        }
    }
    onDragCanceled(event: DragEvent) {
    }

    onDragEnd(event: DragEvent, list: any[]) {
        //    let item1 = list.splice(this.dragIndex, 1)
        //         let item2 = list.splice(this.replaceIndex, 1)
        //         list.splice(this.replaceIndex, 0, item1[0]);
        //         list.splice(this.dragIndex, 0, item2[0]);
        // && this.dragIndex != 0
        if (this.dragIndex < this.replaceIndex && this.dragDropCrmUtilities) {
            this.replaceIndex = this.replaceIndex - 1;
            // if (this.replaceIndex != 0) {
            let item1 = list.splice(this.dragIndex, 1)
            let item2 = list.splice(this.replaceIndex, 1)
            list.splice(this.replaceIndex, 0, item1[0]);
            list.splice(this.dragIndex, 0, item2[0]);
            // }
        }
        else if (this.dragIndex > this.replaceIndex && this.dragDropCrmUtilities) {
            // if (this.replaceIndex != 0) {
            let item1 = list.splice(this.dragIndex, 1)
            let item2 = list.splice(this.replaceIndex, 1)
            list.splice(this.replaceIndex, 0, item1[0]);
            list.splice(this.dragIndex, 0, item2[0]);
            // }
        }
        // else if (this.dragIndex == this.replaceIndex) {
        // } else if (this.dragIndex == 0 || this.replaceIndex == 0) {
        // }
        // console.log("n sb", this.dragIndex);
        // console.log("replaceIndexb", this.replaceIndex);
        if (this.dragDropCrmUtilities) {
            this.crmUtilitiesSteps = list;
            this.getcrmUtilitiesOrderUpdateList();
        }
    }

    async getcrmUtilitiesOrderUpdateList() {


        this.commonService.showSpinner();
        try {
            const res$ = this.apiService.postReq(API_PATH.CRM_UTILITIES_ORDER_UPDATE, { company_id: this.lead?.company_id, order: this.crmUtilitiesSteps }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                // this.commonService.showSuccess(response.message);
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
    notesUpdates() {
        this.leadUpdateLogs?.getLeadUpdates();
        this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
    }
    updateLogs() {
        this.leadUpdateLogs?.getLeadUpdates();
        this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
    }


    async getEmailTemplateExists(tabSection: any, actionType: any) {
        this.commonService.showSpinner();
        try {
            const res$ = this.apiService.postReq(API_PATH.LEAD_EMAIL_TEMPLATE_EXIST, { lead_id: this.leadID, action_type: actionType }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                // this.commonService.showSuccess(response.message);
                if (tabSection != false) {
                    this.scrollToTabs(tabSection, actionType)
                } else {
                    this.activeTab = actionType
                }

            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error?.error?.data.already_exist == 0) {
                Swal.fire({
                    title: error?.error?.message,
                    icon: 'warning',
                    // showCancelButton: true,
                    confirmButtonText: 'OK',
                    confirmButtonColor: this.color,
                }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        Swal.close()
                    }
                })
            } else {
                if (error.error && error.error.message) {
                    this.commonService.showError(error.error.message);
                } else {
                    this.commonService.showError(error.message);

                }
            }
        }
    }

    async checkEmailTemplateExists(model: any, actionType: any) {
        this.commonService.showSpinner();
        try {
            const res$ = this.apiService.postReq(API_PATH.LEAD_EMAIL_TEMPLATE_EXIST, { lead_id: this.leadID, action_type: actionType }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                // this.commonService.showSuccess(response.message);
                if (actionType == 'Withdraw') {
                    this.withdrawLead(model);
                } else if (actionType == 'Propose Submission') {
                    this.router.navigate([`/${this.userBaseRoute}/propose-submission/` + this.leadID]);
                } else if (actionType == 'Request Stips') {
                    this.router.navigate([`/${this.userBaseRoute}/final-underwriting/` + this.leadID]);
                } else if (actionType == 'Decline') {
                    this.declineLeadModal(model);
                } else if (actionType == 'Create Contract') {
                    this.router.navigate([`/${this.userBaseRoute}/creating-contract/` + this.leadID]);
                } else if (actionType == 'Lender Offer' && model == 'crm') {
                    this.router.navigate([`/${this.userBaseRoute}/lead-createlenderoffer/` + this.leadID]);
                } else if (actionType == 'Lender Offer' && model == 'Lender Offers') {
                    this.activeTab = model
                } else if (actionType == 'Deal Participants') {
                    this.router.navigate([`/${this.userBaseRoute}/fund-details/` + this.leadID]);
                } else if (actionType == 'Merchant') {
                    this.sendEmail(model)
                } else if (actionType == 'Notify to Submissions') {
                    this.onNotifySubmission();
                } else if (actionType == 'Funding Record') {
                    this.router.navigate([`/${this.userBaseRoute}/funding-record-list/` + this.leadID]);
                } else if (actionType == 'Accepted Lender Offer') {
                    this.check(model);
                } else if (actionType == 'Pre Fund') {
                    this.router.navigate([`/${this.userBaseRoute}/fund/fund-records/` + this.leadID]);

                }
                // else if (actionType == 'Lender Offer Decline') {
                //     this.declineOfferPopup(model);
                // }

            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error?.error?.data.already_exist == 0) {
                Swal.fire({
                    title: error?.error?.message,
                    icon: 'warning',
                    // showCancelButton: true,
                    confirmButtonText: 'OK',
                    confirmButtonColor: this.color,
                }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        Swal.close()
                    }
                })
            } else {
                if (error.error && error.error.message) {
                    this.commonService.showError(error.error.message);
                } else {
                    this.commonService.showError(error.message);

                }
            }
        }
    }
    async checkSubmittedDealsEmailTemplateExists(model: any, actionType: any, Type: any) {
        if (this.companyType == 'broker') {
            this.commonService.showSpinner();
            try {
                const res$ = this.apiService.postReq(API_PATH.LEAD_EMAIL_TEMPLATE_EXIST, { lead_id: this.leadID, action_type: actionType }, 'lead', 'view');
                let response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    if (actionType == 'Lender Offer Decline' && Type == 'outerDecline') {
                        this.deleteLender(model);
                    } else {
                        this.declineOfferPopup(model);
                    }
                }
                this.commonService.hideSpinner();
            } catch (error: any) {
                this.commonService.hideSpinner();
                if (error?.error?.data.already_exist == 0) {
                    Swal.fire({
                        title: error?.error?.message,
                        icon: 'warning',
                        // showCancelButton: true,
                        confirmButtonText: 'OK',
                        confirmButtonColor: this.color,
                    }).then((result) => {
                        if (result.value) {
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            Swal.close()
                        }
                    })
                } else {
                    if (error.error && error.error.message) {
                        this.commonService.showError(error.error.message);
                    } else {
                        this.commonService.showError(error.message);

                    }
                }
            }
        } else {
            if (Type == 'outerDecline') {
                this.deleteLender(model);
            } else {
                this.declineOfferPopup(model);
            }
        }

    }


    async lenderOfferExists(lenderId: any, type: any) {
        this.commonService.showSpinner();
        try {
            const res$ = this.apiService.postReq(API_PATH.LENDER_OFFER_EXISTS_SUBMITTED_DEALS, { lead_id: this.leadID, lender_id: lenderId }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data && response.status_code == "200") {
                this.initSubmittedDealsForm();
                if (response.data.lender_offer_exist == 1) {
                    this.submittedDealslenderofferId = response.data.lenders[0].lender_offer_id;
                    if (type == 'accept') {
                        this.updateLenderOfferStatus(lenderId, 2, 1, '', 'accept');
                        this.getLeadDetailsList();
                        // if(this.companyType == 'broker'){
                        // // this.router.navigate([`/${this.userBaseRoute}/edit-lender-offer/` + this.leadID + '/' + this.submittedDealslenderofferId], { queryParams: { mode: 'edit' } });
                        // this.router.navigate([`/${this.userBaseRoute}/lead-createlenderoffer/` + this.leadID], { queryParams: { lender: lenderId } });
                        // }
                    } else {
                        this.initDeclineForm();
                        this.openModalDecline(this.rejectOffer);
                    }

                }
                if (response.data.lender_offer_exist == 2) {
                    this.submittedLenderList = response.data.lenders;
                    for (let i = 0; i < this.submittedLenderList.length; i++) {
                        if (this.submittedLenderList[i].funded_rejected == 'funded' && this.companyType == 'broker') {
                            this.submittedDealsLenderForm.patchValue({
                                lender_id: this.submittedLenderList[i].lender_offer_id
                            })
                        }


                    }
                    this.submittedDealsType = type;
                    this.openSubmittedDeals(this.submittedDealsLender, lenderId);
                }
                // console.log("kjhjk",this.lenderOfferIds)

                // this.lenderOfferId = response.data.lender_offer_id;
                //  this.updateLenderOfferStatus(lenderId, 2, 1, '', 'accept');
                // this.getLeadDetailsList();

            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error?.error?.data.lender_offer_exist == 0) {
                Swal.fire({
                    title: error?.error?.message,
                    icon: 'warning',
                    // showCancelButton: true,
                    confirmButtonText: 'OK',
                    confirmButtonColor: this.color,
                }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        Swal.close()
                    }
                })
            } else {
                if (error.error && error.error.message) {
                    this.commonService.showError(error.error.message);
                } else {
                    this.commonService.showError(error.message);

                }
            }
        }
    }

    async lenderOfferRejectExists(lenderId: any, type: any) {
        this.commonService.showSpinner();
        try {
            const res$ = this.apiService.postReq(API_PATH.LENDER_OFFER_EXISTS_SUBMITTED_DEALS, { lead_id: this.leadID, lender_id: lenderId }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data && response.status_code == "200") {
                this.initSubmittedDealsForm();
                if (response.data.lender_offer_exist == 1) {
                    this.submittedDealslenderofferId = response.data.lenders[0].lender_offer_id;
                    this.initDeclineForm();
                    this.openModalDecline(this.rejectOffer);
                    // if (type == 'accept') {
                    //     this.updateLenderOfferStatus(lenderId, 2, 1, '', 'accept');
                    //     this.getLeadDetailsList();
                    // } else {
                    //     this.initDeclineForm();
                    //     this.openModalDecline(this.rejectOffer);
                    // }

                }
                if (response.data.lender_offer_exist == 2) {
                    this.submittedLenderList = response.data.lenders;
                    for (let i = 0; i < this.submittedLenderList.length; i++) {
                        if (this.submittedLenderList[i].funded_rejected == 'funded' && this.companyType == 'broker') {
                            this.submittedDealsLenderForm.patchValue({
                                lender_id: this.submittedLenderList[i].lender_offer_id
                            })
                        }


                    }
                    this.submittedDealsType = type;
                    this.openSubmittedDeals(this.submittedDealsLender, lenderId);
                }
                // console.log("kjhjk",this.lenderOfferIds)

                // this.lenderOfferId = response.data.lender_offer_id;
                //  this.updateLenderOfferStatus(lenderId, 2, 1, '', 'accept');
                // this.getLeadDetailsList();

            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error?.error?.data.lender_offer_exist == 0) {
                this.initDeclineForm();
                this.openModalDecline(this.rejectOffer);
                // Swal.fire({
                //     title: error?.error?.message,
                //     icon: 'warning',
                //     // showCancelButton: true,
                //     confirmButtonText: 'OK',
                //     confirmButtonColor: this.color,
                // }).then((result) => {
                //     if (result.value) {
                //     } else if (result.dismiss === Swal.DismissReason.cancel) {
                //         Swal.close()
                //     }
                // })
            } else {
                if (error.error && error.error.message) {
                    this.commonService.showError(error.error.message);
                } else {
                    this.commonService.showError(error.message);

                }
            }
        }
    }

    submitSubmittedLender() {
        this.submittedDealsLenderForm.markAllAsTouched()
        if (this.submittedDealsLenderForm.valid) {
            this.submittedDealslenderofferId = this.submittedDealsLenderForm.value.lender_id;
            if (this.submittedDealsType == 'accept') {
                this.updateLenderOfferStatus(this.submittedDealslenderId, 2, 1, '', 'accept');
                this.getLeadDetailsList();
                this.closeSubmittedDealsModal();
            } else {
                this.closeSubmittedDealsModal();
                this.initDeclineForm();
                this.openModalDecline(this.rejectOffer);
                // this.getLeadDetailsList();
            }

        }
    }
    async getAssignedOptions() {
        try {
            // + `?role=${Roles.UNDERWRITER}`
            // this.commonService.showSpinner();
            let url = `?sort_by=first_name&dir=ASC`
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + url, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.closerList = response?.data
                // ?.sort((a:any, b:any) => a.name.localeCompare(b.name));
                // this.assigedList = response.data
            }
            this.commonService.hideSpinner();
            return Promise.resolve();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
            return Promise.reject();
        }
    }
    onHoldModel(templateRef: TemplateRef<any>) {
        if (this.lead.hold_note == '') {
            this.initHoldForm()
            try {
                this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
            } catch (error: any) {
                this.commonService.showError(error.message);
            }
        } else {
            this.unhold();
        }

    }
    closeOnHoldModal() {
        this.modal.close();
    }
    //
    get h(): { [key: string]: AbstractControl } {
        return this.holdForm.controls;
    }
    initHoldForm() {
        this.holdForm = this.fb.group({
            hold_note: ['', [Validators.required]]
        })
    }
    async updateHold() {
        this.holdForm.markAllAsTouched();
        if (this.holdForm.valid) {
            try {
                this.commonService.showSpinner();
                let data = {
                    lead_id: this.leadID,
                    hold_note: this.holdForm.value.hold_note,
                    type: this.lead.hold_note == '' ? 'hold' : 'unhold',
                }
                const res$ = this.apiService.postReq(API_PATH.LEAD_HOLD, data, 'lead', 'view');
                let response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.closeOnHoldModal();
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                    this.activeTab = 'Documents'
                    this.getLeadDetailsList();
                    this.leadUpdateLogs?.getLeadUpdates();
                    this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
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

    }

    unhold() {
        Swal.fire({
            title: 'Do you want to unhold this lead',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: this.color,
        }).then((result) => {
            if (result.value) {
                this.updateUnHold();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
            }
        })
    }
    async updateUnHold() {
        try {
            this.commonService.showSpinner();
            let data = {
                lead_id: this.leadID,
                type: 'unhold',
            }
            const res$ = this.apiService.postReq(API_PATH.LEAD_HOLD, data, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                this.activeTab = 'Documents'
                this.getLeadDetailsList();
                this.leadUpdateLogs?.getLeadUpdates();
                this.leadSubmissionUpdateLogs?.getLeadSubmissionUpdates();
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
    getEventResponse(e: any) {
        if (e == true) {
            this.getlendersList();
        }
    }
    // opne lead FCS section on model
    openLeadFcs(templateRef: any) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', windowClass: 'custom-width', scrollable: true });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    closeLeadFcsModal() {
        this.modal.close();
        this.activeTab = 'Documents'
        this.router.navigate([], {
            queryParams: {
                'activeTab': null,
            },
            queryParamsHandling: 'merge'
        })
    }

    deleteLender(lender: any) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to decline this lender' + ' - ' + lender.name + '?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: this.color,
        }).then((result) => {
            if (result.value) {
                // this.initDeclineForm();
                // this.openModalDecline(this.rejectOffer); 
                this.initLenderDeclineForm();
                this.openModalDecline(this.lenderrejectOffer);
                this.LenderDeclineId = lender.id
                // this.lenderOfferExists(lender.id, 'accept');
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
            }
        })
    }
    getLenderdeclineUpdate() {
        this.lenderdeclineForm.markAllAsTouched();
        if (this.lenderdeclineForm.valid) {
            this.lenderOfferDeclineExists(this.LenderDeclineId)
            //     const lenderId = this.LenderDeclineId
            //    // const lenderId = this.lenderID
            //     this.updateLenderOfferStatus(lenderId, 3, 2, '', 'decline');
            //     this.closeModal();
        }

    }
    async lenderOfferDeclineExists(lenderId: any) {
        this.commonService.showSpinner();
        try {
            const res$ = this.apiService.postReq(API_PATH.LENDER_OFFER_EXISTS_SUBMITTED_DEALS, { lead_id: this.leadID, lender_id: lenderId }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data && response.status_code == "200") {
                this.updateLenderOfferStatus(lenderId, 3, 2, '', 'decline');
                this.closeModal();
                //     if (response.data.lender_offer_exist == 1) {
                //         this.submittedDealslenderofferId = response.data.lenders[0].lender_offer_id;
                //         this.updateLenderOfferStatus(lenderId, 3, 2, '', 'decline');
                //         this.closeModal();
                //     }
                // } else {
                //     this.updateLenderOfferStatus(lenderId, 3, 2, '', 'decline');
                //     this.closeModal();
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error?.error?.data.lender_offer_exist == 0) {
                this.updateLenderOfferStatus(lenderId, 3, 2, '', 'decline');
                this.closeModal();
            } else {
                if (error.error && error.error.message) {
                    this.commonService.showError(error.error.message);
                } else {
                    this.commonService.showError(error.message);

                }
            }
        }
    }
    get userBaseRoute() {
        return this.authService.getUserRole();
    }


    async getJSonDataForWebHook() {
        try {
            let url = '';
            url = `?lead_id=${this.leadID}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.WEBHOOK_CENTREX + url, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                //enable CSV download
                if (response.data.length) {
                    this.excel.csvWebhook(response.data)
                }
                this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                this.activeTab = 'Updates'
                this.leadUpdateLogs?.getLeadUpdates();
                // disable download CSV file
                // if (response.data.length) {
                //     this.excel.csvWebhook(response.data)
                // }
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
    //replace on 4th oct
    async exclusivetimeUpdate(time: any, status: string) {
        try {
            if (status == 'add') {
                time = Number(time) + 1
            } else if (status == 'subtract') {
                if (time == 0) {
                    time = 0
                } else {
                    time = Number(time) - 1
                }

            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_EXCLUSIVE_PERIOD, { lead_id: this.leadID, status_id: this.LeadStatus, exclusive_time: time }, 'lead', 'updates');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.getLeadDetailsList();
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
    //

    ngOnDestroy() {
        if (this.subsc) {
            this.subsc.unsubscribe();
        }
        if (this.colorSubs) {
            this.colorSubs.unsubscribe();
        }
    }
    ngAfterContentChecked() {
        this.cdr.detectChanges();
    }
    inintexclusiveForm() {
        this.exclusivePeriodForm = this.fb.group({
            timePeriod: [this.excluisveTimeValue ?? 0, [Validators.pattern(Custom_Regex.numberWithHypen)]]
        })
    }
    exclusiveModal(templateRef: TemplateRef<any>, status: string, excluisveValue: string | number) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static', size: 'md' });
            this.inintexclusiveForm();
            this.excluisveTimeValue = excluisveValue;
            if (status == 'add') {
                this.getExclusiveStatus = 'add'
            } else {
                this.getExclusiveStatus = 'subtract'
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    modalClose() {
        this.modal.close();

    }
    async excluisveSubmit() {
        // -Math.abs(num); make negative number
        let currentValue = 0;
        this.exclusivePeriodForm.markAllAsTouched();
        // return
        // console.log( this.getExclusiveStatus, this.excluisveTimeValue);
        try {
            if (this.exclusivePeriodForm.valid) {
                //   console.log(this.exclusivePeriodForm);

                if (this.getExclusiveStatus == 'add') {
                    currentValue = Number(this.exclusivePeriodForm.value.timePeriod) + Number(this.excluisveTimeValue);
                } else if (this.getExclusiveStatus == 'subtract') {
                    if (this.excluisveTimeValue == 0)
                        currentValue = 0
                    else
                        currentValue = Number(this.excluisveTimeValue) - Math.abs(Number(this.exclusivePeriodForm.value.timePeriod));
                }
                if (currentValue < 0)
                    currentValue = 0;

                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_EXCLUSIVE_PERIOD, { lead_id: this.leadID, status_id: this.LeadStatus, exclusive_time: currentValue }, 'lead', 'updates');
                const response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.excluisveTimeValue = currentValue;
                    this.getLeadDetailsList();
                    this.modal.close();

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
    get experiod(): { [key: string]: AbstractControl } {
        return this.exclusivePeriodForm.controls;
    }
    // update assignedTo field
    async changeAssignedTo(id: string) {
        try {
            this.commonService.showSpinner();
            if (this.Closer != '' || this.leadAssignedTo != '') {
                if (this.Closer == this.leadAssignedTo) {
                    Swal.fire({
                        title: 'Please update, assigned to & closer should not be same',
                        icon: 'warning',
                        showCancelButton: false,
                        confirmButtonText: ' Ok',
                        confirmButtonColor: this.color,
                        cancelButtonText: 'Cancel'
                    })
                    setTimeout(() => this.leadAssignedTo = this.lead?.assigned_to, 0);
                    this.commonService.hideSpinner();
                    return;
                }
            }

            const res$ = this.apiService.postReq(API_PATH.ASSIGNED_TO_UPDATE, { lead_id: this.leadID, assigned_to: this.leadAssignedTo }, 'lead', 'updates');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                //   this.getLeadDetailsList();
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
    async getAssignedToList() {
        try {
            // + `?role=${Roles.UNDERWRITER}`
            let url = `?sort_by=${'first_name'}&dir=${'ASC'}&assigned_to=assignedTo`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + url, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.assigedList = response?.data
                // ?.sort((a:any, b:any) => a.name.localeCompare(b.name));
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
    getFcsSheetLink(event: { url: string, isSavedFcs: boolean }) {
        if (this.companyType == 'broker') {
            if (event.isSavedFcs)
                if (event.url) this.getFCSUrl = event.url
            window.open(this.getFCSUrl, "_blank")

        }
    }
    checkPermission() {
      
        if (this.canViewFundDetails) {
            if(this.companyType == 'broker'){
                this.router.navigate([`/${this.userBaseRoute}/fund-details/` + this.leadID])
            }else{
                this.verifyAdvancedIdtoProceed();
            }
        } else {
            this.commonService.showError('You do not have required authorization')
        }
    }
    //Exclusive 
    async exclusiveTrigger() {
        try {

            this.commonService.showSpinner();
            let data = {
                lead_id: this.leadID

            }
            const res$ = this.apiService.postReq(API_PATH.EXCLUSIVE_REMOVE, data, 'exclusive', 'period-remove');
            let response = await lastValueFrom(res$);
            if (response) {
            this.isAddExcluisve = response?.data?.add_exclusivity;
            this.getLeadDetailsList();
  
            }
            this.commonService.hideSpinner();
            return Promise.resolve();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
            return Promise.reject();
        }
    }
  
    removeExclusive() {
       
        this.exclusiveTrigger();
       
        this.modalClose();
    }
    verifyAdvancedIdtoProceed(){
      if(this.companyType === 'funded'){
          if(this.lead?.advance_id){
              this.router.navigate([`/${this.userBaseRoute}/fund-details/` + this.leadID]);
          }else{
              this.commonService.showError('Please add advanced id before proceeding to this module.')
              return
          }
      }
        

    }
}
