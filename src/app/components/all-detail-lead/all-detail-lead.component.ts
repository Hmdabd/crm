import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    selector: 'app-all-detail-lead',
    templateUrl: './all-detail-lead.component.html',
    styleUrls: ['./all-detail-lead.component.scss']
})
export class AllDetailLeadComponent implements OnInit {
    @ViewChild('acc', { static: false }) accordion!: NgbAccordion;
    lead: any = {};
    modal!: NgbModalRef;
    @Input() leadId: string = '';
    dateFormat: string = "";
    timeZone: string = "";
    @Output() leadDetails: EventEmitter<any> = new EventEmitter();
    companyType: string = '';

    canDeclineLead: boolean = false;
    isLeadDeclined: boolean = true;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color: string = '';
    fundedCompanyTrue: boolean = false;
    canExclusivePeriod: boolean = false;
    exclusivePeriodForm!: FormGroup;
    getExclusiveStatus: string = ''
    excluisveTimeValue: string | number = '';
    LeadStatus: string = '';
    constructor(private commonService: CommonService,
        private apiService: ApiService,
        private modalService: NgbModal,
        private authService: AuthService,
        private fb: FormBuilder) { }

    ngOnInit(): void {
        this.getLeadDetailsList();
        this.getUserDetails();
        this.canDeclineLead = this.authService.hasPermission('lead-decline');
        this.canExclusivePeriod = this.authService.hasPermission('exclusive-period');
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.dateFormat =  ud.date_format;
                this.timeZone = ud.time_zone;
                this.companyType = ud.company_type;
                this.color = ud.color;
                if (this.companyType == 'funded') {
                    this.fundedCompanyTrue = true;
                } else {
                    this.fundedCompanyTrue = false;
                }
                this.getColorOnUpdate();
                            this.style={fill:ud?.color};
                            // this.color=ud?.color;
                                // this.stroke={stroke:ud?.color};
                                this.background={background:ud?.color};
            
               
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    async getLeadDetailsList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_DETAILS + this.leadId, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lead = response.data;
                this.LeadStatus = response.data?.lead_status_id;
                this.isLeadDeclined = this.lead.is_lead_declined ? true : false;
                this.leadDetails.emit(response.data);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    declineLeadModal(templateRef: TemplateRef<any>) {
        try {
            this.modal = this.modalService.open(templateRef, { backdrop: 'static' });
        } catch (error) {
            this.commonService.showErrorMessage(error);
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
        getBussinessDate(date: any) {
            return moment(date).format(`${this.dateFormat}`)
    
        }

    leadDeclined() {
        this.isLeadDeclined = true;
        this.lead.lead_status = 'Declined'
        this.closeModal();
        this.getLeadDetailsList();
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
    toggle(ID: string) {
        setTimeout(() => this.accordion.toggle(ID), 0);
    }
    
    async checkEmailTemplateExists(model: any, actionType: any) {
        this.commonService.showSpinner();
        try {
            const res$ = this.apiService.postReq(API_PATH.LEAD_EMAIL_TEMPLATE_EXIST, { lead_id: this.leadId, action_type: actionType }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                // this.commonService.showSuccess(response.message);
                if (actionType == 'Decline') {
                    this.declineLeadModal(model);
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
                const res$ = this.apiService.postReq(API_PATH.LEAD_EXCLUSIVE_PERIOD, { lead_id: this.leadId, status_id: this.LeadStatus, exclusive_time: currentValue }, 'lead', 'updates');
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

}
