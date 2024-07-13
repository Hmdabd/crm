import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { BarController } from 'chart.js';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-lead-create-lender-offer-list',
    templateUrl: './lead-create-lender-offer-list.component.html',
    // , '../../../styles/dashboard.scss'
    styleUrls: ['./lead-create-lender-offer-list.component.scss']
})
export class LeadCreateLenderOfferListComponent implements OnInit {
    leadID: string = '';
    lenderList: Array<any> = [];
    page: number = 1;
    limit: number = 10;
    total: number = 0;
    canCreateLenderOffer: boolean = false;
    canDeleteLenderOffer: boolean = false;
    canViewLenderOffer: boolean = false;
    canEditLenderOffer: boolean = false;
    @Input() leadDetails: any = {};
    @Input() leadStatusPermsn: any = {};
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    declinedOfferList: Array<any> = [];
    declinedpage: number = 1;
    declinedlimit: number = 100;
    declinedtotal: number = 0;
    dateFormat: string = '';
    timeZone: string = '';
    companyType: string = '';
    @Output() deleteLenderList = new EventEmitter<boolean>();
    deleteResponse:boolean = true;
    declineForm!: FormGroup;
    canAddDeclineNote: boolean = false;
    constructor(
        private route: ActivatedRoute,
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
        private el: ElementRef,
    ) { }

    ngOnInit(): void {
        this.initAddDeclineForm();
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLenderOfferList();
            this.getDeclinedOfferList();
        } else {
            this.commonService.showError('');
        }
        this.canCreateLenderOffer = this.authService.hasPermission('lender-offer-create');
        this.canViewLenderOffer = this.authService.hasPermission('lender-offer-view');
        this.canEditLenderOffer = this.authService.hasPermission('lender-offer-update');
        this.canDeleteLenderOffer = this.authService.hasPermission('lender-offer-delete');
        this.canAddDeclineNote = this.authService.hasPermission('lender-offer-list');
        this.getUserDetails();
    }
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {

            this.getColorOnUpdate();
            this.style = { fill: ud?.color };
            this.color = ud?.color;
            this.companyType = ud?.company_type
            this.dateFormat = ud.date_format;
            this.timeZone = ud.time_zone;

            this.background = { background: ud?.color };
        }
    }
    
    ngDoCheck(): void {

        this.getPaginationList();
    }
    getPaginationList() {
        let index;
        if(this.companyType == 'funded'){
            index = 2;
        }else{
            index = 3;
        }
        // change index 0 -> 1 22
        let data = document.getElementsByClassName('ngx-pagination')[index]?.getElementsByTagName('li');
        for (let i = 0; i < data?.length; i++) {
            if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                data[i].style.background = this.color;
            } else {
                data[i].style.background = 'none';

            }
        }




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

    /**
     * @description get lead updatessss
     */
    async getLenderOfferList() {
        try {
            let url = `?&page=${this.page}&lead_id=${this.leadID}`;
            this.commonService.showSpinner();
            let res$ = this.apiService.getReq(API_PATH.LENDER_OFFER_LISTING + url, 'lender', 'offer-list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data && response.data.data) {
                    this.lenderList = response.data.data;
                    this.total = response.data.total
                } else {
                    this.lenderList = [];
                    this.total = 0;
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
   * @description get lead updatessss
   */
    async getDeclinedOfferList() {
        try {
            let url = `?&page=${this.declinedpage}&lead_id=${this.leadID}`;
            this.commonService.showSpinner();
            let res$ = this.apiService.getReq(API_PATH.LENDER_OFFER_DECINED + url, 'lender', 'offer-list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data && response.data.data) {
                    this.declinedOfferList = response.data.data;
                    this.declinedtotal = response.data.total
                } else {
                    this.declinedOfferList = [];
                    this.declinedtotal = 0;
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
    async deleteLenderOffer(id: any): Promise<void> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LENDER_OFFER_DELETE, { lender_offer_id: id }, 'lender', 'offer-delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                this.lenderList = this.lenderList.filter(el => !id.includes(el.lender_offer_id));
                this.deleteLenderList.emit(this.deleteResponse);

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
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p 
     */
    onPageChange(p: number): void {
        this.page = p;
        this.getLenderOfferList();
    }
    async checkEmailTemplateExists(actionType: any, mode: any, lenderOfferId: any) {
        this.commonService.showSpinner();
        if(actionType == 'Disclouser Document'){
            if(this.leadDetails.e_sign_status == 'hub_sign'){
                actionType =  'Disclosure Document - Hub Sign'
            }else{
                actionType == 'Disclouser Document'  
            }
        }
        try {
            const res$ = this.apiService.postReq(API_PATH.LEAD_EMAIL_TEMPLATE_EXIST, { lead_id: this.leadID, action_type: actionType }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (actionType == 'Lender Offer' && mode == 'create') {
                    this.router.navigate([`/${this.userBaseRoute}/lead-createlenderoffer/` + this.leadID]);
                } else if((actionType == 'Disclouser Document' || actionType == 'Disclosure Document - Hub Sign')){
                    this.disclosureEmail(lenderOfferId)
                } else if(actionType == 'Revised Lender Offer'){
                    this.router.navigate([`/${this.userBaseRoute}/edit-lender-offer/` + this.leadID + '/' + lenderOfferId], { queryParams: { mode: 'edit' } });
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
  async  disclosureEmail(lenderOfferId: any){
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DISCLOUSER_EMAIL, { lead_id: this.leadID,lender_offer_id: lenderOfferId }, 'lender', 'offer-list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
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

        }
    }
    initAddDeclineForm(): void {
        this.declineForm = this.fb.group({
            decline_reason: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.maxLength(500)]],
        })
    }
    get f(): { [key: string]: AbstractControl } {
        return this.declineForm.controls;
    }
    async addDeclineSubmit(): Promise<void> {
        this.declineForm.markAllAsTouched();
        if (this.declineForm.valid) {
            try {
                this.commonService.showSpinner();

                let data = {
                    ...this.declineForm.value,
                    lead_id:this.leadID
                }
                const res$ = this.apiService.postReq(API_PATH.LENDER_OFFER_ADD_DECLINE_REASON, data, 'lead', 'submission');
                let response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.declineForm.reset();
                    this.getDeclinedOfferList();
                 

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
            this.focusInvalidField();
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
    viewLenderCheckDisclosureState(actionType: any, mode: any, lenderOfferId: any) {
        if(this.leadDetails.disclouser_status){
                if (actionType == 'Lender Offer' && mode == 'create') {
                    this.router.navigate([`/${this.userBaseRoute}/lead-createlenderoffer/` + this.leadID]);
                } else if(actionType == 'Revised Lender Offer'){
                    this.router.navigate([`/${this.userBaseRoute}/edit-lender-offer/` + this.leadID + '/' + lenderOfferId], { queryParams: { mode: 'edit' } });
                }
        }else{
            this.checkEmailTemplateExists(actionType,mode,lenderOfferId)
        }
    }
}

