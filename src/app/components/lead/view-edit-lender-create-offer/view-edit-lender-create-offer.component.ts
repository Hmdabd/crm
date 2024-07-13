import { Component, OnInit, Inject, LOCALE_ID, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Roles, companyType } from '@constants/constants';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { formatCurrency } from '@angular/common';
import moment from 'moment';
import { Options } from '@angular-slider/ngx-slider';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-view-edit-lender-create-offer',
    templateUrl: './view-edit-lender-create-offer.component.html',
    styleUrls: ['./view-edit-lender-create-offer.component.scss']
})
export class ViewEditLenderCreateOfferComponent implements OnInit {
    //     activeTab: string = 'Create';
    //     createForm!: FormGroup;
    //     preFundForm!: FormGroup;
    //     lenderList: Array<any> = [];
    //     leadID: string = '';
    //     maxDate!: NgbDateStruct;
    //     editMode: boolean = false;
    //     preFundtype: Array<any> = [];
    //     preFundAdvancetype: Array<any> = [];
    //     preFundUnittype: Array<any> = [];
    //     agentList: Array<any> = [];
    //     userRole: string = '';
    //     lenderOfferID: string = '';
    //     lenderOffer: any = {};
    //     canEditLenderOffer: boolean = false;
    //     lead: any = {}
    //     termLables: string = 'Days';
    //     style!: { fill: string; };
    //     background!: { background: string; };
    //     colorSubs!: Subscription;
    //     color!: string;
    //     conditionCheck: boolean = false;
    //     pointsList: Array<any> = [];
    //     activelenderList: Array<any> =  [];
    //     dateFormat: string = '';
    //     @ViewChild('selectAll') selectAll!: ElementRef;
    //     lenderIdArray: Array<any> =  [];
    // 	fcsDetailList: any;


    //     constructor(
    //         private fb: FormBuilder,
    //         private apiService: ApiService,
    //         private commonService: CommonService,
    //         private route: ActivatedRoute,
    //         private router: Router,
    //         private authService: AuthService,
    //         private calendar: NgbCalendar,
    //         @Inject(LOCALE_ID) public locale: string,

    //     ) { }

    //     ngOnInit(): void {
    //         this.maxDate = this.calendar.getToday();
    //         this.initCreateForm();
    //         this.getDropdownOptions();
    //         let params = this.route.snapshot.params;
    //         let query = this.route.snapshot.queryParams;
    //         if (params['id'] || params['leadid']) {
    //             this.lenderOfferID = params['id'];
    //             this.leadID = params['leadid'];
    //             this.getLenderOfferData();

    //         }
    //         if (query['mode'] && query['mode'] === 'edit') {
    //             this.editMode = true;
    //         }
    //         this.getUserDetails();
    //         this.getLenderOptions();
    //         this.getfcsDetail();
    //         this.canEditLenderOffer = this.authService.hasPermission('lender-offer-update');
    //     }

    //     /**
    //   * @description get user details from localstrorage
    //   * @author Shine Dezign Infonet Pvt. Ltd.
    //   * @returns {void}
    //   */
    //     getUserDetails(): void {
    //         try {
    //             let ud = this.authService.getUserDetails();
    //             if (ud) {
    //                 this.dateFormat = ud.date_format;
    //                 this.userRole = ud.role;
    //                 this.getColorOnUpdate();
    //                 this.style = { fill: ud?.color };
    //                 this.color = ud?.color;
    //                 // this.stroke={stroke:ud?.color};
    //                 this.background = { background: ud?.color };

    //             }
    //         } catch (error: any) {
    //             this.commonService.showError(error.message);
    //         }
    //     }
    //     getColorOnUpdate() {
    //         this.colorSubs = this.authService.getColor().subscribe((u) => {
    //             this.getUserDetails();
    //         });
    //     }
    //     get userBaseRoute() {
    //         return this.authService.getUserRole().toLowerCase();
    //     }

    //     getpaymentData() {
    //         if (this.preFundAdvancetype.length) {
    //             let data = this.createForm.get('payment_type')?.value;
    //             let actual_number = 0;
    //             for (let x of this.preFundAdvancetype) {
    //                 if (data === x.id) {
    //                     let data = x.name;
    //                     if (data == 'Daily ') {
    //                         actual_number = 21;
    //                         this.termLables = 'Days'
    //                     } else if (data == 'Weekly ') {
    //                         actual_number = 4;
    //                         this.termLables = 'Weeks'
    //                     } else if (data == 'Bi-Weekly ') {
    //                         actual_number = 2;
    //                         this.termLables = 'Bi-weeks'
    //                     } else if (data == 'Monthly ') {
    //                         actual_number = 1;
    //                         this.termLables = 'Months'
    //                     }
    //                     let withhold_value: any = 0;
    //                     let total_average_monthly_revenue = this.lead?.monthly_true_revenue
    //                     if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
    //                         withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
    //                         if (withhold_value < 1) {
    //                             withhold_value = (withhold_value) * 100;
    //                         } else {
    //                             withhold_value = withhold_value;
    //                         }
    //                     } else {
    //                         withhold_value = 0;
    //                     }
    //                     let total_withhold: any = Number(this.lead?.total_withhold)
    //                 total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
    //                 withhold_value = withhold_value.toFixed(2);
    //                 if (withhold_value.split('.').length > 1) {
    //                     withhold_value.split('.')[1] = '00';
    //                     withhold_value = (+(withhold_value) + 0.0000001).toString();
    //                 }
    //                 total_withhold = total_withhold.toFixed(2);
    //                 if (total_withhold.split('.').length > 1) {
    //                     total_withhold.split('.')[1] = '00';
    //                     total_withhold = (+(total_withhold) + 0.0000001).toString();
    //                 }

    //                 this.createForm.patchValue({ "withhold": withhold_value });
    //                 this.createForm.patchValue({ "total_withhold": total_withhold })

    //                 }
    //             }
    //         }

    //     }

    //     getFundValue() {
    //         let fund = this.createForm.get('funded_rejected')?.value;
    //         if (fund == 'funded') {
    //             this.createForm.get('apply_to_function')?.setValue(true);
    //             this.conditionCheck = true;
    //         } else {
    //             this.createForm.get('apply_to_function')?.setValue(false);
    //             this.conditionCheck = false;


    //         }



    //     }
    //     getCheckedFund() {
    //         let data = this.createForm.get('apply_to_function')?.value;

    //         if (data === true) {
    //             this.createForm.get('funded_rejected')?.setValue('funded');
    //             this.conditionCheck = true;

    //         } else {
    //             this.conditionCheck = false;

    //             this.createForm.get('funded_rejected')?.setValue('');
    //         }

    //     }


    //     initCreateForm(): void {
    //         this.createForm = this.fb.group({
    //             lender_id: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
    //             funding_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
    //             sell_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
    //             rtr: [0, [Validators.required, Validators.pattern(Custom_Regex.amount)]],
    //             // rtr: [0, [Validators.required, Validators.pattern(/^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*\.[0-9]{2}$/)]],
    //             payment_type: [''],
    //             payment: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
    //             term_in_days: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
    //             buy_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
    //             position: [''],
    //             funded_rejected: [''],
    //             apply_to_function: [false],
    //             points: [''],
    //             withhold: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
    //             total_withhold: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]]
    //         })
    //         if (this.createForm.value.apply_to_function === true) {
    //             this.conditionCheck = true;
    //         } else {
    //             this.conditionCheck = false;
    //         }
    //     }


    //     get f(): { [key: string]: AbstractControl } {
    //         return this.createForm.controls;
    //     }
    //     sellrate(value: any) {
    //         if (Number(this.createForm.value.sell_rate) > 100) {
    //             this.commonService.showError("Please enter value less than or equal to 100")
    //             this.createForm.patchValue({ sell_rate: '' })
    //         } else if (Number(this.createForm.value.sell_rate) < Number(this.createForm.value.buy_rate)) {
    //             this.commonService.showError("Sell rate can't be less than buy rate")
    //             this.createForm.patchValue({ sell_rate: '' })
    //         } else {
    //             let total_value = 0;
    //             total_value = Number(this.createForm.value.funding_amount) * Number(this.createForm.value.sell_rate);
    //             this.createForm.patchValue({ rtr: total_value.toFixed(2) })
    //             let payment_value: any = 0;
    //             if (this.createForm.value.term_in_days != '') {
    //                 payment_value = Number(this.createForm.value.rtr) / Number(this.createForm.value.term_in_days)
    //                 payment_value = payment_value.toFixed(2);
    //                 if (payment_value.split('.').length > 1) {
    //                     payment_value.split('.')[1] = '00';
    //                     payment_value = (+(payment_value) + 0.0000001).toString();
    //                 }
    //                 this.createForm.patchValue({ payment: payment_value });
    //                 let data = this.createForm.get('payment_type')?.value;
    //                 let actual_number = 0;
    //                 for (let x of this.preFundAdvancetype) {
    //                     if (data === x.id) {
    //                         let data = x.name;
    //                         if (data == 'Daily ') {
    //                             actual_number = 21;
    //                         } else if (data == 'Weekly ') {
    //                             actual_number = 4;
    //                         } else if (data == 'Bi-Weekly ') {
    //                             actual_number = 2;
    //                         } else if (data == 'Monthly ') {
    //                             actual_number = 1;
    //                         }
    //                         let withhold_value: any = 0;
    //                         let total_average_monthly_revenue = this.lead?.monthly_true_revenue
    //                         if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
    //                             withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
    //                             if (withhold_value < 1) {
    //                                 withhold_value = (withhold_value) * 100;
    //                             } else {
    //                                 withhold_value = withhold_value;
    //                             }
    //                         } else {
    //                             withhold_value = 0;
    //                         }
    //                         let total_withhold: any = Number(this.lead?.total_withhold)
    //                         total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
    //                         withhold_value = withhold_value.toFixed(2);
    //                         if (withhold_value.split('.').length > 1) {
    //                             withhold_value.split('.')[1] = '00';
    //                             withhold_value = (+(withhold_value) + 0.0000001).toString();
    //                         }
    //                         total_withhold = total_withhold.toFixed(2);
    //                         if (total_withhold.split('.').length > 1) {
    //                             total_withhold.split('.')[1] = '00';
    //                             total_withhold = (+(total_withhold) + 0.0000001).toString();
    //                         }

    //                         this.createForm.patchValue({ "withhold": withhold_value });
    //                         this.createForm.patchValue({ "total_withhold": total_withhold })

    //                     }
    //                 }
    //                 // this.createForm.patchValue({ payment: payment_value.toFixed(2) })
    //             }


    //         }

    //     }
    //     fundingAmount(value: any) {
    //         let total_value = 0;
    //         total_value = Number(this.createForm.value.funding_amount) * Number(this.createForm.value.sell_rate);
    //         let data = formatCurrency(total_value, this.locale, '');

    //         this.createForm.patchValue({ rtr: total_value.toFixed(2) });
    //         let payment_value: any = 0;
    //         if (this.createForm.value.term_in_days != '') {
    //             payment_value = Number(this.createForm.value.rtr) / Number(this.createForm.value.term_in_days)
    //             payment_value = payment_value.toFixed(2);
    //             if (payment_value.split('.').length > 1) {
    //                 payment_value.split('.')[1] = '00';
    //                 payment_value = (+(payment_value) + 0.0000001).toString();
    //             }
    //             this.createForm.patchValue({ payment: payment_value });
    //             let data = this.createForm.get('payment_type')?.value;
    //             let actual_number = 0;
    //             for (let x of this.preFundAdvancetype) {
    //                 if (data === x.id) {
    //                     let data = x.name;
    //                     if (data == 'Daily ') {
    //                         actual_number = 21;
    //                     } else if (data == 'Weekly ') {
    //                         actual_number = 4;
    //                     } else if (data == 'Bi-Weekly ') {
    //                         actual_number = 2;
    //                     } else if (data == 'Monthly ') {
    //                         actual_number = 1;
    //                     }
    //                     let withhold_value: any = 0;
    //                     let total_average_monthly_revenue = this.lead?.monthly_true_revenue
    //                     if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
    //                         withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
    //                         if (withhold_value < 1) {
    //                             withhold_value = (withhold_value) * 100;
    //                         } else {
    //                             withhold_value = withhold_value;
    //                         }
    //                     } else {
    //                         withhold_value = 0;
    //                     }
    //                     let total_withhold: any = Number(this.lead?.total_withhold)
    // 				    total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
    // 					withhold_value = withhold_value.toFixed(2);
    // 					if (withhold_value.split('.').length > 1) {
    // 						withhold_value.split('.')[1] = '00';
    // 						withhold_value = (+(withhold_value) + 0.0000001).toString();
    // 					}
    // 					total_withhold = total_withhold.toFixed(2);
    // 					if (total_withhold.split('.').length > 1) {
    // 						total_withhold.split('.')[1] = '00';
    // 						total_withhold = (+(total_withhold) + 0.0000001).toString();
    // 					}

    // 					this.createForm.patchValue({ "withhold": withhold_value });
    // 					this.createForm.patchValue({ "total_withhold": total_withhold })

    //                 }
    //             }
    //             // this.createForm.patchValue({ payment: payment_value.toFixed(2) });
    //         }

    //     }
    //     buyrate(value: any) {
    //         if (Number(this.createForm.value.buy_rate) > 100) {
    //             this.commonService.showError("Please enter value less than or equal to 100")
    //             this.createForm.patchValue({ buy_rate: '' })
    //         } else if (Number(this.createForm.value.buy_rate) > Number(this.createForm.value.sell_rate)) {
    //             this.commonService.showError("Buy rate can't be greater than sell rate")
    //             this.createForm.patchValue({ buy_rate: '' })
    //         }

    //     }
    //     // getPayment(value: any) {
    //     //     let payment_value = 0;
    //     //     payment_value = Number(this.createForm.value.rtr) / Number(value)
    //     //     this.createForm.patchValue({ payment: payment_value.toFixed(2) })

    //     // }
    //     getPayment(value: any) {
    //         let payment_value: any = 0;
    //         payment_value = Number(this.createForm.value.rtr) / Number(value);
    //         payment_value = payment_value.toFixed(2);
    //         if (payment_value.split('.').length > 1) {
    //             payment_value.split('.')[1] = '00';
    //             payment_value = (+(payment_value) + 0.0000001).toString();
    //         }
    //         this.createForm.patchValue({ payment: payment_value });
    //         let data = this.createForm.get('payment_type')?.value;
    // 		let actual_number = 0;
    // 		for (let x of this.preFundAdvancetype) {
    // 			if (data === x.id) {
    // 				let data = x.name;
    // 				if (data == 'Daily ') {
    // 					actual_number = 21;
    // 				} else if (data == 'Weekly ') {
    // 					actual_number = 4;
    // 				} else if (data == 'Bi-Weekly ') {
    // 					actual_number = 2;
    // 				} else if (data == 'Monthly ') {
    // 					actual_number = 1;
    // 				}
    // 				let withhold_value: any = 0;
    // 				let total_average_monthly_revenue = this.lead?.monthly_true_revenue
    // 				if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
    // 					withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
    // 					if (withhold_value < 1) {
    // 						withhold_value = (withhold_value) * 100;
    // 					} else {
    // 						withhold_value = withhold_value;
    // 					}
    // 				} else {
    // 					withhold_value = 0;
    // 				}
    //                 let total_withhold: any = Number(this.lead?.total_withhold)
    //                 total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
    //                 withhold_value = withhold_value.toFixed(2);
    //                 if (withhold_value.split('.').length > 1) {
    //                     withhold_value.split('.')[1] = '00';
    //                     withhold_value = (+(withhold_value) + 0.0000001).toString();
    //                 }
    //                 total_withhold = total_withhold.toFixed(2);
    //                 if (total_withhold.split('.').length > 1) {
    //                     total_withhold.split('.')[1] = '00';
    //                     total_withhold = (+(total_withhold) + 0.0000001).toString();
    //                 }

    //                 this.createForm.patchValue({ "withhold": withhold_value });
    //                 this.createForm.patchValue({ "total_withhold": total_withhold })
    // 			}
    // 		}
    //     }

    //     patchValues(): void {
    //         let data = formatCurrency(this.lenderOffer?.funding_amount, this.locale, '');
    //         this.createForm.patchValue({
    //             lender_id: this.lenderOffer?.lender_id,
    //             // funding_amount:data,
    //             funding_amount: this.lenderOffer?.funding_amount,
    //             sell_rate: this.lenderOffer?.sell_rate,
    //             rtr: this.lenderOffer?.rtr,
    //             payment_type: this.lenderOffer?.payment_type,
    //             payment: this.lenderOffer?.payment,
    //             term_in_days: this.lenderOffer?.terms,
    //             buy_rate: this.lenderOffer?.buy_rate,
    //             position: this.lenderOffer?.position,
    //             funded_rejected: this.lenderOffer?.funding_rejected,
    //             apply_to_function: this.lenderOffer?.apply_to_function,
    //             points: this.lenderOffer?.points, 
    //             withhold: this.lenderOffer?.withhold,
    //             total_withhold: Number(this.lenderOffer?.total_withhold).toFixed(2),

    //         })
    //         if (this.lenderOffer?.apply_to_function === true) {
    //             this.conditionCheck = true;
    //         } else {
    //             this.conditionCheck = false;
    //         }

    //         let data1 = this.createForm.get('payment_type')?.value;
    //         if (this.preFundAdvancetype.length) {
    //             for (let x of this.preFundAdvancetype) {
    //                 if (data1 === x.id) {
    //                     // this.termLables = x.name;
    //                     let data = x.name;
    //                     // console.log("gy", this.termLables);
    //                     if (data == 'Daily ') {
    //                         this.termLables = 'Days'
    //                     } else if (data == 'Weekly ') {
    //                         this.termLables = 'Weeks'
    //                     } else if (data == 'Bi-Weekly ') {
    //                         this.termLables = 'Bi-weeks'
    //                     } else if (data == 'Monthly ') {
    //                         this.termLables = 'Months'
    //                     }
    //                 }
    //             }
    //         }


    //     }
    //     async getDropdownOptions() {
    //         try {
    //             this.commonService.showSpinner();
    //             const res$ = this.apiService.postReq(API_PATH.GET_PRE_FUND_DROPDOWNS, { group_name: ['pre_fund_type', 'pre_fund_advance_type', 'pre_fund_unit_type', 'points'] }, '', '');
    //             let response = await lastValueFrom(res$);
    //             if (response && response.data) {
    //                 this.preFundtype = response.data.pre_fund_type;
    //                 this.preFundAdvancetype = response.data.pre_fund_advance_type;
    //                 this.pointsList = response.data.points;
    //                 let array = [];
    //                 for (let i = 0; i < this.preFundAdvancetype.length; i++) {
    //                     if (i < 4) {
    //                         let text = this.preFundAdvancetype[i].name.toString().replace("ACH", "");
    //                         this.preFundAdvancetype[i].name = text;
    //                         array.push(this.preFundAdvancetype[i]);
    //                     }
    //                 }
    //                 this.preFundAdvancetype = array;
    //                 this.preFundUnittype = response.data.pre_fund_unit_type;

    //             }
    //             this.commonService.hideSpinner();
    //         } catch (error: any) {
    //             this.commonService.hideSpinner();
    //             if (error.error && error.error.message) {
    //                 this.commonService.showError(error.error.message);
    //             } else {
    //                 this.commonService.showError(error.message);
    //             }
    //         }
    //     }
    //     async getLenderOfferData() {
    //         let url = `?&lender_offer_id=${this.lenderOfferID}`;
    //         try {
    //             this.commonService.showSpinner();
    //             const res$ = this.apiService.getReq(API_PATH.VIEW_CREATE_LENDER_OFFER + url, 'lender', 'offer-list');
    //             let response = await lastValueFrom(res$);
    //             if (response && response.status_code == "200") {
    //                 if (response.data) {
    //                     this.lenderOffer = response.data;                
    //                     this.patchValues();
    //                 }
    //             }
    //             this.commonService.hideSpinner();
    //         } catch (error: any) {
    //             this.commonService.hideSpinner();
    //             if (error.error && error.error.message) {
    //                 this.commonService.showError(error.error.message);
    //             } else {
    //                 this.commonService.showError(error.message);
    //             }
    //         }
    //     }


    //     async getLenderOptions() {
    //         try {
    //             this.commonService.showSpinner();
    //             const res$ = this.apiService.postReq(API_PATH.LENDER_LIST, { lead_id: this.leadID }, '', '');
    //             let response = await lastValueFrom(res$);
    //             if (response && response.data) {
    //                 this.lenderList = response.data;
    //             }
    //             this.commonService.hideSpinner();
    //         } catch (error: any) {
    //             this.commonService.hideSpinner();
    //             if (error.error && error.error.message) {
    //                 this.commonService.showError(error.error.message);
    //             } else {
    //                 this.commonService.showError(error.message);
    //             }
    //         }
    //     }
    //     async addCreateLenderOffer() {
    //         this.createForm.markAllAsTouched();
    //         if (this.createForm.valid) {
    //             let data = {
    //                 ...this.createForm.value,
    //                 lender_offer_id: this.lenderOfferID,
    //                 lead_id: this.leadID,
    //                 update: "update"
    //             }
    //             try {
    //                 this.commonService.showSpinner();
    //                 const res$ = this.apiService.postReq(API_PATH.CREATE_LENDER_OFFER, data, 'lender', 'offer-create');
    //                 let response = await lastValueFrom(res$);
    //                 if (response.api_response == 'success') {
    //                     this.commonService.showSuccess(response.message);
    //                     this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID],
    //                         { queryParams: { activeTab: 'Lender Offers' } });
    //                 }
    //                 this.commonService.hideSpinner();
    //             } catch (error: any) {
    //                 this.commonService.hideSpinner();
    //                 if (error.error && error.error.message) {
    //                     this.commonService.showError(error.error.message);
    //                 } else {
    //                     this.commonService.showError(error.message);
    //                 }
    //             }
    //         }

    //     }
    //     cancel() {
    //         this.editMode = !this.editMode;
    //         this.patchValues();
    //     }
    //     getLeadBasicDetails(leadData: any) {
    //         this.lead = leadData;
    //         // this.createForm.patchValue({ total_withhold: this.lead.total_withhold })

    //     }
    //     // getTermDays() {
    //     //     const formData = this.createForm.value;
    //     //     if (formData.rtr != '' && formData.payment != '') {
    //     //         let days = Number(formData.rtr) / Number(formData.payment)
    //     //         this.createForm.patchValue({ term_in_days: Math.round(days) })
    //     //     }
    //     //     let Payment = formData.payment.toFixed(2);
    //     //     if (Payment.split('.').length > 1) {
    //     //         Payment.split('.')[1] = '00';
    //     //         Payment = (+(Payment) + 0.0000001).toString();
    //     //     }
    //     //     this.createForm.patchValue({ payment: Payment })
    //     // }
    //     getTermDays() {
    //         const formData = this.createForm.value;
    //         if (formData.rtr != '' && formData.payment != '') {
    //             let days = Number(formData.rtr) / Number(formData.payment)
    //             this.createForm.patchValue({ term_in_days: Math.round(days) })
    //         }
    //         let Payment = formData.payment.toFixed(2);
    //         if (Payment.split('.').length > 1) {
    //             Payment.split('.')[1] = '00';
    //             Payment = (+(Payment) + 0.0000001).toString();
    //         }
    //         this.createForm.patchValue({ payment: Payment });
    //         let data = this.createForm.get('payment_type')?.value;
    //         let actual_number = 0;
    //         for (let x of this.preFundAdvancetype) {
    //             if (data === x.id) {
    //                 let data = x.name;
    //                 if (data == 'Daily ') {
    //                     actual_number = 21;
    //                 } else if (data == 'Weekly ') {
    //                     actual_number = 4;
    //                 } else if (data == 'Bi-Weekly ') {
    //                     actual_number = 2;
    //                 } else if (data == 'Monthly ') {
    //                     actual_number = 1;
    //                 }
    //                 let withhold_value: any = 0;
    //                 let total_average_monthly_revenue = this.lead?.monthly_true_revenue
    //                 if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
    //                     withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
    //                     if (withhold_value < 1) {
    //                         withhold_value = (withhold_value) * 100;
    //                     } else {
    //                         withhold_value = withhold_value;
    //                     }
    //                 } else {
    //                     withhold_value = 0;
    //                 }
    //                 let total_withhold: any = Number(this.lead?.total_withhold)
    //                 total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
    //                 withhold_value = withhold_value.toFixed(2);
    //                 if (withhold_value.split('.').length > 1) {
    //                     withhold_value.split('.')[1] = '00';
    //                     withhold_value = (+(withhold_value) + 0.0000001).toString();
    //                 }
    //                 total_withhold = total_withhold.toFixed(2);
    //                 if (total_withhold.split('.').length > 1) {
    //                     total_withhold.split('.')[1] = '00';
    //                     total_withhold = (+(total_withhold) + 0.0000001).toString();
    //                 }

    //                 this.createForm.patchValue({ "withhold": withhold_value });
    //                 this.createForm.patchValue({ "total_withhold": total_withhold })
    //             }
    //         }
    //     }

    //     changeWithhold(){
    // 		let total_withhold: any = Number(this.lead?.total_withhold)
    // 		total_withhold = Number(this.lead?.total_withhold) + Number(this.createForm.value.withhold);
    // 		total_withhold = total_withhold.toFixed(2);
    // 		if (total_withhold.split('.').length > 1) {
    // 			total_withhold.split('.')[1] = '00';
    // 			total_withhold = (+(total_withhold) + 0.0000001).toString();
    // 		}

    // 		this.createForm.patchValue({ "total_withhold": total_withhold })

    // 	}

    //     //lender section
    //     //lender section
    // 	async getfcsDetail() {
    //         try {
    //             this.commonService.showSpinner();
    //             const res$ = this.apiService.postReq(API_PATH.FCS_LEAD_DETAILS, { lead_id: this.leadID }, 'fcs', ' preview');
    //             const response = await lastValueFrom(res$);
    //             if (response && response.data) {
    //                 this.fcsDetailList = response.data;
    //                 // this.withHoldValue =Number(this.fcsDetailList?.withholding_percentage).toFixed(2);
    //                 this.activelenderList = response.data.lender;

    //                 this.activelenderList = response.data.syndicates.map((e: any) => ({ ...e, selected: false }));
    //                 this.selectAll.nativeElement.checked = false;
    //                 this.activelenderList.forEach((object) => { object.toggle = false });

    //             } else {
    //                 this.commonService.showError(response.message);
    //             }
    //             this.commonService.hideSpinner();
    //         } catch (error: any) {
    //             this.commonService.hideSpinner();
    //             if(error?.error.message != 'FCS not saved yet.'){
    //                 this.commonService.showErrorMessage(error);
    //             }

    //         }
    //     }
    // 	onLenderChange(id: any, target: EventTarget | null, index: number) {
    //         const input = target as HTMLInputElement;
    //         if (input.checked) {
    //             this.lenderIdArray = []
    //             this.activelenderList[index].status = 1;
    //             if (!this.lenderIdArray.includes(id)) {
    //                 this.lenderIdArray.push(id);
    //             }
    //             this.getactiveLender(1)
    // 			// this.getfcsDetail();
    //         } 
    //         else {
    //             this.lenderIdArray = []
    //             this.activelenderList[index].status = 0;
    //             if (!this.lenderIdArray.includes(id)) {
    //                 this.lenderIdArray.push(id);
    //             }
    //             this.getactiveLender(0)
    // 			// this.getfcsDetail();
    //         }

    //     }
    // 	getwithhold(){
    // 		let sum = 0;
    // 		for (let index = 0; index < this.activelenderList.length; index++) {
    // 			// console.log(this.activelenderList[index])
    // 			if (this.activelenderList[index].status == 1){
    // 				sum +=this.activelenderList[index].with_hold
    // 			}
    // 		}
    // 		let total_withhold = Number(this.createForm.value.withhold) + sum;
    // 		this.createForm.patchValue({ "total_withhold": total_withhold })
    // 	}
    // 	async getactiveLender(status: any) {
    //         try {
    //             this.commonService.showSpinner();
    //             const res$ = this.apiService.postReq(API_PATH.LENDER_UPDATE_STATUS, {id: this.lenderIdArray , status: status}, 'fcs', ' preview');
    //             const response = await lastValueFrom(res$);
    //             if (response) {
    //                 let index = this.activelenderList.findIndex((e)=> { e.id ===  this.lenderIdArray});
    //                 if(index > -1) {
    //                     this.activelenderList[index].status = status
    //                 }
    //                 this.commonService.showSuccess(response.message);
    //             } else {
    //                 this.commonService.showError(response.message);
    //             }
    //             this.commonService.hideSpinner();
    //         } catch (error: any) {
    //             this.commonService.hideSpinner();
    //             if(error?.error.message != 'FCS not saved yet.'){
    //                 this.commonService.showErrorMessage(error);
    //             }

    //         }
    //     }
    // 	getDate(date: any) {
    //         // .tz(this.timeZone)
    //         if(date){
    //             return moment(date).format(`${this.dateFormat}`)
    //         } else{
    //              return ''
    //         }

    //     }
    // }
    companyType: string = '';
    fundingvalue: number = 0;
    fundingoptions: Options = {
        floor: 0,
        ceil: 10000000
    };

    withholdvalue: number = 0;
    withholdoptions: Options = {
        floor: 0,
        ceil: 100
    };

    factorratevalue: number = 0;
    factorrateoptions: Options = {
        floor: 0,
        ceil: 100
    };

    termvalue: number = 0;
    termoptions: Options = {
        floor: 0,
        ceil: 1000000
    };

    dailyPaymentvalue: number = 0;
    dailyPaymentoptions: Options = {
        floor: 0,
        ceil: 10000000
    };


    activeTab: string = 'Create';
    createForm!: FormGroup;
    preFundForm!: FormGroup;
    lenderList: Array<any> = [];
    leadID: string = '';
    maxDate!: NgbDateStruct;
    editMode: boolean = false;
    preFundtype: Array<any> = [];
    preFundAdvancetype: Array<any> = [];
    preFundUnittype: Array<any> = [];
    agentList: Array<any> = [];
    userRole: string = '';
    lenderOfferID: string = '';
    lenderOffer: any = {};
    canEditLenderOffer: boolean = false;
    lead: any = {}
    termLables: string = 'Days';
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    // conditionCheck: boolean = false;
    pointsList: Array<any> = [];
    activelenderList: Array<any> = [];
    dateFormat: string = '';
    @ViewChild('selectAll') selectAll!: ElementRef;
    lenderIdArray: Array<any> = [];
    fcsDetailList: any;
    existingWithhold: number = 0;
    sliderDetails: any = {};
    canViewLenderOffers: boolean = false;
    paymentLabels: string = 'Daily';
    docTypes: any = [];
    stipsArray: Array<any> = [];
    placeholderArray: Array<any> = [];
    finalExistingWithhold: number = 0;
    lenderSubmitDisabled: boolean = false;
    typeCompany = companyType;
	checkColorValue: boolean = false;


    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private calendar: NgbCalendar,
        @Inject(LOCALE_ID) public locale: string,
        private cdr: ChangeDetectorRef,

    ) { }

    ngOnInit(): void {
        this.maxDate = this.calendar.getToday();
        this.initCreateForm();
        this.getDropdownOptions();
        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        if (params['id'] || params['leadid']) {
            this.lenderOfferID = params['id'];
            this.leadID = params['leadid'];
            this.getLenderOfferData();
            this.getDocumentTypes()

        }
        if (query['mode'] && query['mode'] === 'edit') {
            this.editMode = true;
        }
        this.getUserDetails();
        this.getfcsDetail();
        this.canEditLenderOffer = this.authService.hasPermission('lender-offer-update');
        this.updatePermission();
    }
    updatePermission() {
        this.canViewLenderOffers = this.authService.hasPermission('lender-offer-list');
        if (this.companyType == 'funded') {
            this.getISOList();
        } else {
            this.getLenderOptions();
        }
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
                this.dateFormat = ud.date_format;
                this.userRole = ud.role;
                this.companyType = ud.company_type;
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
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    getpaymentData() {
        if (this.preFundAdvancetype.length) {
            let data = this.createForm.get('payment_type')?.value;
            let actual_number = 0;
            let operator_term_in_days = '/'
            for (let x of this.preFundAdvancetype) {
                if (data === x.id) {
                    let data = x.name;
                    if (data == 'Daily ') {
                        actual_number = 21;
                        operator_term_in_days = '*'
                        this.termLables = 'Days'
                        this.paymentLabels = 'Daily'
                    } else if (data == 'Weekly ') {
                        // actual_number = 4;
                        actual_number = 4.20;
                        operator_term_in_days = '/'
                        this.termLables = 'Weeks'
                        this.paymentLabels = 'Weekly'
                    } else if (data == 'Bi-Weekly ') {
                        actual_number = 2;
                        this.termLables = 'Bi-weeks'
                        this.paymentLabels = 'Bi-Weekly'
                    } else if (data == 'Monthly ') {
                        actual_number = 1;
                        this.termLables = 'Months'
                        this.paymentLabels = 'Monthly'
                    }
                    let withhold_value: any = 0;
                    let total_average_monthly_revenue = this.lead?.monthly_true_revenue
                    if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
                        withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
                        if (withhold_value < 1) {
                            withhold_value = (withhold_value) * 100;
                        } else {
                            withhold_value = withhold_value;
                        }
                    } else {
                        withhold_value = 0;
                    }
                    // let total_withhold: any = Number(this.lead?.total_withhold)
                    // total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
                    withhold_value = withhold_value.toFixed(2);
                    this.withholdvalue = withhold_value;
                    if (withhold_value.split('.').length > 1) {
                        withhold_value.split('.')[1] = '00';
                        withhold_value = (+(withhold_value) + 0.0000001).toString();
                    }
                    // total_withhold = total_withhold.toFixed(2);
                    // if (total_withhold.split('.').length > 1) {
                    //     total_withhold.split('.')[1] = '00';
                    //     total_withhold = (+(total_withhold) + 0.0000001).toString();
                    // }
                    // this.createForm.patchValue({ "total_withhold": total_withhold })

                    this.createForm.patchValue({ "withhold": withhold_value });
                    this.getwithhold();
                    if (this.companyType == 'funded') {
                        let term_in_days = Number(this.createForm.value.term_in_days) / 5
                        if (operator_term_in_days == '/') {
                            term_in_days = Number(this.createForm.value.term_in_days) / 5
                        } else {
                            term_in_days = Number(this.createForm.value.term_in_days) * 5
                        }
                        setTimeout(() => {
                            this.termvalue = term_in_days
                            
                        }, 100);
                        this.createForm.patchValue({ "term_in_days": term_in_days });
                        // calculate payment
                        let payment = Number(this.createForm.value.payment) / 5
                        if (operator_term_in_days == '/') {
                            payment = Number(this.createForm.value.payment) * 5
                        } else {
                            payment = Number(this.createForm.value.payment) / 5
                        }
                        setTimeout(() => {
                            this.dailyPaymentvalue = payment;
                            
                        }, 100);
                       
                        this.createForm.patchValue({ "payment": payment });
                        //withHold as per daily or weekly update
                        let withHoldCalculate: any = 0;

                        let total_average_monthly_revenue = this.lead?.monthly_true_revenue
                        if (payment || total_average_monthly_revenue) {
                            withHoldCalculate = (payment * actual_number) / total_average_monthly_revenue;
                            if (withHoldCalculate < 1) {
                                withHoldCalculate = (withHoldCalculate) * 100;
                            } else {
                                withHoldCalculate = withHoldCalculate;
                            }
                        } else {
                            withHoldCalculate = 0;
                        }
                        withHoldCalculate = withHoldCalculate.toFixed(2);
                        this.withholdvalue = withHoldCalculate
                        if (withHoldCalculate.split('.').length > 1) {
                            withHoldCalculate.split('.')[1] = '00';
                            withHoldCalculate = (+(withHoldCalculate) + 0.0000001).toString();
                        }
                        this.createForm.patchValue({ "withhold": withHoldCalculate });
                        this.getwithhold()
                    }

                }
            }
        }

    }

    getFundValue() {
        let fund = this.createForm.get('funded_rejected')?.value;
        if (this.lead.disclouser_status) {
            if (fund == 'funded') {
                this.createForm.get('apply_to_function')?.setValue(true);
            } else if (fund == 'rejected') {
                this.createForm.get('apply_to_function')?.setValue(false);
            } else {
                this.createForm.get('apply_to_function')?.setValue(false);
            }
        } else {
            if (fund == 'funded') {
                this.checkEmailTemplateExists('Funded Lender Offer')

            } else if (fund == 'rejected') {
                this.checkEmailTemplateExists('Rejected Lender Offer')

            } else {
                this.checkEmailTemplateExists('Accepted Lender Offer')

            }

        }


    }
    getCheckedFund() {
        let data = this.createForm.get('apply_to_function')?.value;
        if (this.lead.disclouser_status) {
            if (data === true) {
                this.createForm.get('funded_rejected')?.setValue('funded');
            } else {
                this.createForm.get('funded_rejected')?.setValue('');
            }
        } else {
            if (data === true) {
                this.checkEmailTemplateExists('Funded Lender Offer')
            } else {
                this.createForm.get('funded_rejected')?.setValue('');
            }
        }


    }


    initCreateForm(): void {
        this.createForm = this.fb.group({
            lender_id: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            funding_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            sell_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            rtr: [0, [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            // rtr: [0, [Validators.required, Validators.pattern(/^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*\.[0-9]{2}$/)]],
            payment_type: [''],
            payment: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            term_in_days: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            buy_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            position: [''],
            funded_rejected: [''],
            apply_to_function: [false],
            points: [''],
            retail_points: ['', [Validators.pattern(Custom_Regex.amount)]],
            withhold: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
            total_withhold: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
            documents: [''],
            notes_for_stips: [''],
            placeholder: [''],
            add_stips: this.fb.array([]),
        });
        // this.addAdditionalStips();
    }

    get additionalStipsArray() {
        return this.createForm.get('add_stips') as FormArray
    }
    additionalStipsForm(value: any, status: any) {
        return this.fb.group({
            document_title: [value?.document_title ? value?.document_title : '', [Validators.pattern(Custom_Regex.spaces)]]
        })
    }
    addAdditionalStips(value: any) {
        return this.additionalStipsArray.push(this.additionalStipsForm({}, value))
    }
    removeStips(i: number) {
        this.additionalStipsArray.removeAt(i);
    }
    get f(): { [key: string]: AbstractControl } {
        return this.createForm.controls;
    }
    sellrate(value: any) {
        this.factorratevalue = this.createForm.value.sell_rate;
        if (Number(this.createForm.value.sell_rate) > this.sliderDetails?.max_factor_rate) {
            let message = 'Please enter value less than or equal to' + ' ' + this.sliderDetails?.max_factor_rate;
            this.commonService.showError(message)
            this.createForm.patchValue({ sell_rate: 0 });
            this.factorratevalue = 0;
        } else if (Number(this.createForm.value.sell_rate) < Number(this.createForm.value.buy_rate)) {
            this.commonService.showError("Sell rate can't be less than buy rate")
            this.createForm.patchValue({ sell_rate: 0 });
            this.factorratevalue = 0
            this.createForm.patchValue({ buy_rate: 0 })
        } else {
            if (this.createForm.value.sell_rate && this.createForm.value.points) {
                let buyRate = 0;
                buyRate = Number(this.createForm.value.sell_rate) - Number(this.createForm.value.points) / 100;
                // this.createForm.patchValue({ buy_rate: buyRate.toFixed(3) });
                if (this.decimalPlaces(this.createForm.value.sell_rate) == 0) {
                    this.createForm.patchValue({ buy_rate: buyRate.toFixed(2) });
                } else {
                    this.createForm.patchValue({ buy_rate: buyRate.toFixed(this.decimalPlaces(this.createForm.value.sell_rate)) });
                }

            }
            let total_value = 0;
            total_value = Number(this.createForm.value.funding_amount) * Number(this.createForm.value.sell_rate);
            this.createForm.patchValue({ rtr: total_value.toFixed(2) })
            let payment_value: any = 0;
            if (this.createForm.value.term_in_days != '') {
                payment_value = Number(this.createForm.value.rtr) / Number(this.createForm.value.term_in_days);
                payment_value = payment_value.toFixed(2);
                this.dailyPaymentvalue = payment_value
                if (payment_value.split('.').length > 1) {
                    payment_value.split('.')[1] = '00';
                    payment_value = (+(payment_value) + 0.0000001).toString();
                }
                this.createForm.patchValue({ payment: payment_value });
                let data = this.createForm.get('payment_type')?.value;
                let actual_number = 0;
                for (let x of this.preFundAdvancetype) {
                    if (data === x.id) {
                        let data = x.name;
                        if (data == 'Daily ') {
                            actual_number = 21;
                        } else if (data == 'Weekly ') {
                            // actual_number = 4;
                            actual_number = 4.20;
                        } else if (data == 'Bi-Weekly ') {
                            actual_number = 2;
                        } else if (data == 'Monthly ') {
                            actual_number = 1;
                        }
                        let withhold_value: any = 0;
                        let total_average_monthly_revenue = this.lead?.monthly_true_revenue
                        if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
                            withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
                            if (withhold_value < 1) {
                                withhold_value = (withhold_value) * 100;
                            } else {
                                withhold_value = withhold_value;
                            }
                        } else {
                            withhold_value = 0;
                        }
                        // let total_withhold: any = Number(this.lead?.total_withhold)
                        // total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
                        withhold_value = withhold_value.toFixed(2);
                        this.withholdvalue = withhold_value;
                        if (withhold_value.split('.').length > 1) {
                            withhold_value.split('.')[1] = '00';
                            withhold_value = (+(withhold_value) + 0.0000001).toString();
                        }
                        // total_withhold = total_withhold.toFixed(2);
                        // if (total_withhold.split('.').length > 1) {
                        //     total_withhold.split('.')[1] = '00';
                        //     total_withhold = (+(total_withhold) + 0.0000001).toString();
                        // }
                        // this.createForm.patchValue({ "total_withhold": total_withhold })

                        this.createForm.patchValue({ "withhold": withhold_value });
                        this.getwithhold();

                    }
                }
                // this.createForm.patchValue({ payment: payment_value.toFixed(2) })
            }


        }

    }
    fundingAmount(value: any) {
        this.fundingvalue = this.createForm.value.funding_amount;
        if (Number(this.createForm.value.funding_amount) > this.sliderDetails?.max_funding_amount) {
            this.commonService.showError("Please enter value less than or equal to " + this.sliderDetails?.max_funding_amount)
            this.createForm.patchValue({ funding_amount: 0 });
            this.fundingvalue = 0
        }
        let total_value = 0;
        total_value = Number(this.createForm.value.funding_amount) * Number(this.createForm.value.sell_rate);
        let data = formatCurrency(total_value, this.locale, '');

        this.createForm.patchValue({ rtr: total_value.toFixed(2) });
        let payment_value: any = 0;
        if (this.createForm.value.term_in_days != '') {
            payment_value = Number(this.createForm.value.rtr) / Number(this.createForm.value.term_in_days)
            payment_value = payment_value.toFixed(2);
            this.dailyPaymentvalue = payment_value;
            if (payment_value.split('.').length > 1) {
                payment_value.split('.')[1] = '00';
                payment_value = (+(payment_value) + 0.0000001).toString();
            }
            this.createForm.patchValue({ payment: payment_value });
            let data = this.createForm.get('payment_type')?.value;
            let actual_number = 0;
            for (let x of this.preFundAdvancetype) {
                if (data === x.id) {
                    let data = x.name;
                    if (data == 'Daily ') {
                        actual_number = 21;
                    } else if (data == 'Weekly ') {
                        // actual_number = 4;
                        actual_number = 4.20;
                    } else if (data == 'Bi-Weekly ') {
                        actual_number = 2;
                    } else if (data == 'Monthly ') {
                        actual_number = 1;
                    }
                    let withhold_value: any = 0;
                    let total_average_monthly_revenue = this.lead?.monthly_true_revenue
                    if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
                        withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
                        if (withhold_value < 1) {
                            withhold_value = (withhold_value) * 100;
                        } else {
                            withhold_value = withhold_value;
                        }
                    } else {
                        withhold_value = 0;
                    }
                    // let total_withhold: any = Number(this.lead?.total_withhold)
                    // total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
                    withhold_value = withhold_value.toFixed(2);
                    this.withholdvalue = withhold_value;
                    if (withhold_value.split('.').length > 1) {
                        withhold_value.split('.')[1] = '00';
                        withhold_value = (+(withhold_value) + 0.0000001).toString();
                    }
                    // total_withhold = total_withhold.toFixed(2);
                    // if (total_withhold.split('.').length > 1) {
                    //     total_withhold.split('.')[1] = '00';
                    //     total_withhold = (+(total_withhold) + 0.0000001).toString();
                    // }

                    this.createForm.patchValue({ "withhold": withhold_value });
                    // this.createForm.patchValue({ "total_withhold": total_withhold })
                    this.getwithhold();

                }
            }
            // this.createForm.patchValue({ payment: payment_value.toFixed(2) });
        }

    }
    buyrate(value: any) {
        if (Number(this.createForm.value.buy_rate) > 100) {
            this.commonService.showError("Please enter value less than or equal to 100")
            this.createForm.patchValue({ buy_rate: '' })
        } else if (Number(this.createForm.value.buy_rate) > Number(this.createForm.value.sell_rate)) {
            this.commonService.showError("Buy rate can't be greater than sell rate")
            this.createForm.patchValue({ buy_rate: '' })
        }

    }
    // getPayment(value: any) {
    //     let payment_value = 0;
    //     payment_value = Number(this.createForm.value.rtr) / Number(value)
    //     this.createForm.patchValue({ payment: payment_value.toFixed(2) })

    // }
    getPayment(value: any) {
        this.termvalue = this.createForm.value.term_in_days;
        if (Number(this.createForm.value.term_in_days) > this.sliderDetails?.max_term_in_days) {
            this.commonService.showError("Please enter value less than or equal to " + this.sliderDetails?.max_term_in_days)
            this.createForm.patchValue({ term_in_days: 0 });
            this.termvalue = 0
        }
        let payment_value: any = 0;
        payment_value = Number(this.createForm.value.rtr) / Number(value);
        payment_value = payment_value.toFixed(2);
        this.dailyPaymentvalue = payment_value
        if (payment_value.split('.').length > 1) {
            payment_value.split('.')[1] = '00';
            payment_value = (+(payment_value) + 0.0000001).toString();
        }
        this.createForm.patchValue({ payment: payment_value });
        let data = this.createForm.get('payment_type')?.value;
        let actual_number = 0;
        for (let x of this.preFundAdvancetype) {
            if (data === x.id) {
                let data = x.name;
                if (data == 'Daily ') {
                    actual_number = 21;
                } else if (data == 'Weekly ') {
                    // actual_number = 4;
                    actual_number = 4.20;
                } else if (data == 'Bi-Weekly ') {
                    actual_number = 2;
                } else if (data == 'Monthly ') {
                    actual_number = 1;
                }
                let withhold_value: any = 0;
                let total_average_monthly_revenue = this.lead?.monthly_true_revenue
                if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
                    withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
                    if (withhold_value < 1) {
                        withhold_value = (withhold_value) * 100;
                    } else {
                        withhold_value = withhold_value;
                    }
                } else {
                    withhold_value = 0;
                }
                // let total_withhold: any = Number(this.lead?.total_withhold)
                // total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
                withhold_value = withhold_value.toFixed(2);
                this.withholdvalue = withhold_value;
                if (withhold_value.split('.').length > 1) {
                    withhold_value.split('.')[1] = '00';
                    withhold_value = (+(withhold_value) + 0.0000001).toString();
                }
                // total_withhold = total_withhold.toFixed(2);
                // if (total_withhold.split('.').length > 1) {
                //     total_withhold.split('.')[1] = '00';
                //     total_withhold = (+(total_withhold) + 0.0000001).toString();
                // }
                // this.createForm.patchValue({ "total_withhold": total_withhold })

                this.createForm.patchValue({ "withhold": withhold_value });
                this.getwithhold();
            }
        }
    }

    patchValues(): void {
        let data = formatCurrency(this.lenderOffer?.funding_amount, this.locale, '');
        setTimeout(() => {
            if (this.lenderOffer?.points != '') {
                let obj = this.pointsList.filter(e => e.id == this.lenderOffer?.points);
                this.createForm.patchValue({
                    points: obj[0]?.name,
                })
            } else {
                this.createForm.patchValue({
                    points: '',
                })
            }

        }, 100)

        this.fundingvalue = Number(this.lenderOffer?.funding_amount);
        this.withholdvalue = Number(this.lenderOffer?.withhold);
        this.dailyPaymentvalue = Number(this.lenderOffer?.payment);
        this.termvalue = Number(this.lenderOffer?.terms);
        this.factorratevalue = Number(this.lenderOffer?.sell_rate);
        this.createForm.patchValue({
            lender_id: this.lenderOffer?.lender_id,
            // funding_amount:data,
            funding_amount: this.lenderOffer?.funding_amount,
            sell_rate: this.lenderOffer?.sell_rate,
            rtr: this.lenderOffer?.rtr,
            payment_type: this.lenderOffer?.payment_type,
            payment: this.lenderOffer?.payment,
            term_in_days: this.lenderOffer?.terms,
            buy_rate: (this.lenderOffer?.buy_rate),
            position: this.lenderOffer?.position,
            funded_rejected: this.lenderOffer?.funding_rejected,
            apply_to_function: this.lenderOffer?.apply_to_function,
            withhold: this.lenderOffer?.withhold,
            total_withhold: Number(this.lenderOffer?.total_withhold).toFixed(2),
            documents: this.lenderOffer?.documents,
            notes_for_stips: this.lenderOffer?.notes_for_stips,
            placeholder: this.lenderOffer?.placeholder,
            retail_points: this.lenderOffer?.retail_points
            // points:this.lenderOffer?.points,

        })

        let data1 = this.createForm.get('payment_type')?.value;
        if (this.preFundAdvancetype.length) {
            for (let x of this.preFundAdvancetype) {
                if (data1 === x.id) {
                    // this.termLables = x.name;
                    let data = x.name;
                    // console.log("gy", this.termLables);
                    if (data == 'Daily ') {
                        this.termLables = 'Days'
                    } else if (data == 'Weekly ') {
                        this.termLables = 'Weeks'
                    } else if (data == 'Bi-Weekly ') {
                        this.termLables = 'Bi-weeks'
                    } else if (data == 'Monthly ') {
                        this.termLables = 'Months'
                    }
                }
            }

        }

        this.getwithhold();

    }
    async getDropdownOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.GET_PRE_FUND_DROPDOWNS, { group_name: ['pre_fund_type', 'pre_fund_advance_type', 'pre_fund_unit_type', 'points'] }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.preFundtype = response.data.pre_fund_type;
                this.preFundAdvancetype = response.data.pre_fund_advance_type;
                this.pointsList = response.data.points?.map((m: any) => ({ ...m, name: Number(m.name) })).sort((a: any, b: any) => a.name - b.name);;
                let array = [];
                for (let i = 0; i < this.preFundAdvancetype.length; i++) {
                    let text = this.preFundAdvancetype[i].name.toString().replace("ACH", "");
                    this.preFundAdvancetype[i].name = text;
                    if (this.companyType == 'funded') {
                        if (this.preFundAdvancetype[i].name == "Weekly " || this.preFundAdvancetype[i].name == "Daily ") {
                            array.push(this.preFundAdvancetype[i]);
                        }
                    } else {
                        if (this.preFundAdvancetype[i].name == "Bi-Weekly " || this.preFundAdvancetype[i].name == "Monthly " || this.preFundAdvancetype[i].name == "Weekly " || this.preFundAdvancetype[i].name == "Daily ") {
                            array.push(this.preFundAdvancetype[i]);
                        }
                    }
                }
                this.preFundAdvancetype = array;
                // let array = [];
                // for (let i = 0; i < this.preFundAdvancetype.length; i++) {
                //     if (i < 4) {
                //         let text = this.preFundAdvancetype[i].name.toString().replace("ACH", "");
                //         this.preFundAdvancetype[i].name = text;
                //         array.push(this.preFundAdvancetype[i]);
                //     }
                // }
                // this.preFundAdvancetype = array;
                this.preFundUnittype = response.data.pre_fund_unit_type;
                let indexPosition = this.preFundUnittype.map(e => e.name).indexOf('5+ Position')
                if (indexPosition > -1) {
                    let poped = this.preFundUnittype.splice(indexPosition, 1)
                    this.preFundUnittype.push(poped[0])

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
    async getLenderOfferData() {
        let url = `?&lender_offer_id=${this.lenderOfferID}`;
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.VIEW_CREATE_LENDER_OFFER + url, 'lender', 'offer-list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (response.data) {
                    this.lenderOffer = response.data;
                    this.stipsArray = response.data.add_stips;
                    for (let i = 0; i < response.data.add_stips?.length; i++) {
                        this.additionalStipsArray.push(
                            this.additionalStipsForm(response.data.add_stips[i], false)
                        );
                    }
                    if (!this.stipsArray.length && !this.additionalStipsArray.length) {
                        this.addAdditionalStips(true);
                    }
                    this.patchValues();
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


    async getLenderOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LENDER_LIST, { lead_id: this.leadID }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lenderList = response.data;
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
    async addCreateLenderOffer() {
        this.createForm.markAllAsTouched();
        if (this.createForm.dirty) {
            this.lenderSubmitDisabled = true;
        }
        if (!this.lenderSubmitDisabled) {
            return
        }
        if (this.createForm.valid) {
            let obj = this.pointsList.filter(e => e.name == this.createForm.value.points);
            let actualPoint = ''
            if (obj.length) {
                actualPoint = obj[0].id
            } else {
                actualPoint = ''
            }
            let data = {
                ...this.createForm.value,
                lender_offer_id: this.lenderOfferID,
                points: actualPoint,
                lead_id: this.leadID,
                update: "update",
                payment_type_name: this.termLables,
                email_status: (this.createForm.value.funded_rejected != this.lenderOffer?.funding_rejected) ? true : this.createForm.value.funded_rejected == "" ? false : false
            }
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.CREATE_LENDER_OFFER, data, 'lender', 'offer-create');
                let response = await lastValueFrom(res$);
                if (response.api_response == 'success') {
                    this.commonService.showSuccess(response.message);
                    // this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID],
                    //     { queryParams: { activeTab: 'Lender Offers' } });
                    if (this.canViewLenderOffers && this.lead.can_lender_offer_list) {
                        this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID],
                            { queryParams: { activeTab: 'Lender Offers' } });
                    } else {
                        this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID],
                            { queryParams: { activeTab: 'Documents' } });
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

    }
    cancel() {
        this.editMode = !this.editMode;
        this.patchValues();
    }
    getLeadBasicDetails(leadData: any) {
        this.lead = leadData;
        this.getSliderDetails();
        // this.createForm.patchValue({ total_withhold: this.lead.total_withhold })

    }
    // getTermDays() {
    //     const formData = this.createForm.value;
    //     if (formData.rtr != '' && formData.payment != '') {
    //         let days = Number(formData.rtr) / Number(formData.payment)
    //         this.createForm.patchValue({ term_in_days: Math.round(days) })
    //     }
    //     let Payment = formData.payment.toFixed(2);
    //     if (Payment.split('.').length > 1) {
    //         Payment.split('.')[1] = '00';
    //         Payment = (+(Payment) + 0.0000001).toString();
    //     }
    //     this.createForm.patchValue({ payment: Payment })
    // }
    getTermDays() {
        this.dailyPaymentvalue = this.createForm.value.payment;
        if (Number(this.createForm.value.payment) > this.sliderDetails?.max_daily_payment) {
            this.commonService.showError("Please enter value less than or equal to " + this.sliderDetails?.max_daily_payment)
            this.createForm.patchValue({ payment: 0 });
            this.dailyPaymentvalue = 0
        } else {
            const formData = this.createForm.value;
            if (formData.rtr != '' && formData.payment != '') {
                let days = Number(formData.rtr) / Number(formData.payment);
                this.termvalue = Math.round(days);
                this.createForm.patchValue({ term_in_days: Math.round(days) })
            }
            // let Payment = formData.payment.toFixed(2);
            // if (Payment.split('.').length > 1) {
            //     Payment.split('.')[1] = '00';
            //     Payment = (+(Payment) + 0.0000001).toString();
            // }
            // this.createForm.patchValue({ payment: Payment });
            let data = this.createForm.get('payment_type')?.value;
            let actual_number = 0;
            for (let x of this.preFundAdvancetype) {
                if (data === x.id) {
                    let data = x.name;
                    if (data == 'Daily ') {
                        actual_number = 21;
                    } else if (data == 'Weekly ') {
                        // actual_number = 4;
                        actual_number = 4.20;
                    } else if (data == 'Bi-Weekly ') {
                        actual_number = 2;
                    } else if (data == 'Monthly ') {
                        actual_number = 1;
                    }
                    let withhold_value: any = 0;
                    let total_average_monthly_revenue = this.lead?.monthly_true_revenue
                    if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
                        withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
                        if (withhold_value < 1) {
                            withhold_value = (withhold_value) * 100;
                        } else {
                            withhold_value = withhold_value;
                        }
                    } else {
                        withhold_value = 0;
                    }
                    // let total_withhold: any = Number(this.lead?.total_withhold)
                    // total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
                    withhold_value = withhold_value.toFixed(2);
                    this.withholdvalue = withhold_value;
                    if (withhold_value.split('.').length > 1) {
                        withhold_value.split('.')[1] = '00';
                        withhold_value = (+(withhold_value) + 0.0000001).toString();
                    }
                    // total_withhold = total_withhold.toFixed(2);
                    // if (total_withhold.split('.').length > 1) {
                    //     total_withhold.split('.')[1] = '00';
                    //     total_withhold = (+(total_withhold) + 0.0000001).toString();
                    // }
                    // this.createForm.patchValue({ "total_withhold": total_withhold })

                    this.createForm.patchValue({ "withhold": withhold_value });
                    this.getwithhold();
                }
            }
        }

    }

    changeWithhold() {
        this.withholdvalue = this.createForm.value.withhold;
        if (Number(this.createForm.value.withhold) > this.sliderDetails?.max_withhold_percentage) {
            this.commonService.showError("Please enter value less than or equal to " + this.sliderDetails?.max_withhold_percentage)
            this.createForm.patchValue({ withhold: 0 });
            this.withholdvalue = 0
        }
        // let total_withhold: any = Number(this.lead?.total_withhold)
        // total_withhold = Number(this.lead?.total_withhold) + Number(this.createForm.value.withhold);
        // total_withhold = total_withhold.toFixed(2);
        // if (total_withhold.split('.').length > 1) {
        //     total_withhold.split('.')[1] = '00';
        //     total_withhold = (+(total_withhold) + 0.0000001).toString();
        // }

        // this.createForm.patchValue({ "total_withhold": total_withhold })
        this.getwithhold();


    }

    //lender section
    //lender section
    async getfcsDetail() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.FCS_LEAD_DETAILS, { lead_id: this.leadID }, 'fcs', ' preview');
            const response = await lastValueFrom(res$);
            if (response && response.data) {
                this.fcsDetailList = response.data;
                // this.withHoldValue =Number(this.fcsDetailList?.withholding_percentage).toFixed(2);
                this.activelenderList = response.data.lender;
                for (let index = 0; index < this.activelenderList.length; index++) {
                    this.existingWithhold += Number(this.activelenderList[index].with_hold);

                }
                this.getwithhold();
                // this.activelenderList = response.data.lender.map((e: any) => ({ ...e, selected: false }));
                // this.selectAll.nativeElement.checked = false;

                this.activelenderList.forEach((object) => { object.toggle = false });


            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error?.error.message != 'FCS not saved yet.') {
                this.commonService.showErrorMessage(error);
            }

        }
    }
    // onLenderChange(id: any, target: EventTarget | null, index: number) {
    //     const input = target as HTMLInputElement;
    //     if (input.checked) {
    //         this.lenderIdArray = []
    //         this.activelenderList[index].status = 1;
    //         if (!this.lenderIdArray.includes(id)) {
    //             this.lenderIdArray.push(id);
    //         }
    //         this.getactiveLender(1)
    //         // this.getfcsDetail();
    //     } 
    //     else {
    //         this.lenderIdArray = []
    //         this.activelenderList[index].status = 0;
    //         if (!this.lenderIdArray.includes(id)) {
    //             this.lenderIdArray.push(id);
    //         }
    //         this.getactiveLender(0)
    //         // this.getfcsDetail();
    //     }

    // }
    onLenderChange(id: any, target: EventTarget | null, index: number) {
        const input = target as HTMLInputElement;
        let status = 0;
        if (input.checked) {
            this.lenderIdArray = []
            this.activelenderList[index].status = 1;
            if (!this.lenderIdArray.includes(id)) {
                this.lenderIdArray.push(id);
            }
            this.getactiveLender(1)



            // this.lenderIdArray.map((m:any)=>{console.log(m,'id')})
      
        }
        else {
            this.lenderIdArray = []
            this.activelenderList[index].status = 0;
            if (!this.lenderIdArray.includes(id)) {
                this.lenderIdArray.push(id);
            }
            this.getactiveLender(0)


            // let i = this.lenderIdArray.findIndex((x: any) => x === id);
            // if (i > -1) {
            //     this.lenderIdArray.splice(i, 1);
            // }
        }
          this.lenderSubmitDisabled = true;

    }
    getwithhold() {
        // earlier code
        // let sum = 0;
        // for (let index = 0; index < this.activelenderList.length; index++) {
        //     // console.log(this.activelenderList[index])
        //     if (this.activelenderList[index].status == 1){
        //         sum +=this.activelenderList[index].with_hold

        //     }

        // }
        // let total_withhold = Number(this.createForm.value.withhold) + sum;
        // this.createForm.patchValue({ "total_withhold": total_withhold })
        // update runtime total withhold
        let defalutlenderList = 0;
        //
        let activeSum = 0;
        let inactiveSum = 0;
        if (this.activelenderList.length) {
            for (let index = 0; index < this.activelenderList.length; index++) {
                // console.log(this.activelenderList[index])
                if (this.activelenderList[index].status === 1) {
                    activeSum += this.activelenderList[index].with_hold
                    let total_withhold = Number(this.existingWithhold - activeSum) + Number(this.createForm.value.withhold);
                    this.createForm.patchValue({ "total_withhold": total_withhold })
                } else if (this.activelenderList[index].status === 0) {
                    inactiveSum += Number(this.activelenderList[index].with_hold)
                    let total_withhold = Number(this.createForm.value.withhold) + inactiveSum;
                    this.createForm.patchValue({ "total_withhold": total_withhold })

                }
            }
        } else {
            let total_withhold = Number(this.createForm.value.withhold) + defalutlenderList;
            this.createForm.patchValue({ "total_withhold": total_withhold })
        }
        this.finalExistingWithhold = this.existingWithhold - activeSum;

    }
    async getactiveLender(status: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LENDER_UPDATE_STATUS, { id: this.lenderIdArray, status: status }, 'fcs', ' preview');
            const response = await lastValueFrom(res$);
            if (response) {
                let index = this.activelenderList.findIndex((e) => { e.id === this.lenderIdArray });
                if (index > -1) {
                    this.activelenderList[index].status = status
                }
                this.getwithhold();
                this.commonService.showSuccess(response.message);
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error?.error.message != 'FCS not saved yet.') {
                this.commonService.showErrorMessage(error);
            }

        }
    }
    getDate(date: any) {
        // .tz(this.timeZone)
        if (date) {
            return moment(date).format(`${this.dateFormat}`)
        } else {
            return ''
        }

    }

    onChangeFundingAmountSlider() {
        this.lenderSubmitDisabled = true;
        this.createForm.patchValue({ "funding_amount": this.fundingvalue.toFixed() });
        let total_value = 0;
        total_value = (this.createForm.value.funding_amount) * (this.createForm.value.sell_rate);
        let data = formatCurrency(total_value, this.locale, '');
        this.createForm.patchValue({ rtr: total_value.toFixed(2) });

        let payment_value: any = 0;
        if (this.createForm.value.term_in_days != '') {
            payment_value = (Number(this.createForm.value.rtr)) / (Number(this.createForm.value.term_in_days));
            payment_value = payment_value.toFixed(2);
            this.dailyPaymentvalue = payment_value
            if (payment_value.split('.').length > 1) {
                payment_value.split('.')[1] = '00';
                payment_value = (+(payment_value) + 0.0000001).toString();
            }
            this.createForm.patchValue({ payment: payment_value });
            let data = this.createForm.get('payment_type')?.value;
            let actual_number = 0;
            for (let x of this.preFundAdvancetype) {
                if (data === x.id) {
                    let data = x.name;
                    if (data == 'Daily ') {
                        actual_number = 21;
                    } else if (data == 'Weekly ') {
                        // actual_number = 4;
                        actual_number = 4.20;
                    } else if (data == 'Bi-Weekly ') {
                        actual_number = 2;
                    } else if (data == 'Monthly ') {
                        actual_number = 1;
                    }
                    let withhold_value: any = 0;
                    let total_average_monthly_revenue = this.lead?.monthly_true_revenue
                    if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
                        withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
                        if (withhold_value < 1) {
                            withhold_value = (withhold_value) * 100;
                        } else {
                            withhold_value = withhold_value;
                        }
                    } else {
                        withhold_value = 0;
                    }
                    // let total_withhold: any = Number(this.lead?.total_withhold)
                    //     total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
                    withhold_value = withhold_value.toFixed(2);
                    this.withholdvalue = withhold_value;
                    if (withhold_value.split('.').length > 1) {
                        withhold_value.split('.')[1] = '00';
                        withhold_value = (+(withhold_value) + 0.0000001).toString();
                    }
                    // total_withhold = total_withhold.toFixed(2);
                    // if (total_withhold.split('.').length > 1) {
                    //     total_withhold.split('.')[1] = '00';
                    //     total_withhold = (+(total_withhold) + 0.0000001).toString();
                    // }
                    // this.createForm.patchValue({ "total_withhold": total_withhold })

                    this.createForm.patchValue({ "withhold": withhold_value });
                    this.getwithhold();

                }
            }
            // this.createForm.patchValue({ payment: payment_value.toFixed(2) })
        }

    }

    onChangeWithholdSlider() {
        this.lenderSubmitDisabled = true;
        this.createForm.patchValue({ "withhold": this.withholdvalue.toFixed() });
        // let total_withhold: any = Number(this.lead?.total_withhold)
        // total_withhold = Number(this.lead?.total_withhold) + Number(this.createForm.value.withhold);
        // total_withhold = total_withhold.toFixed(2);
        // if (total_withhold.split('.').length > 1) {
        //     total_withhold.split('.')[1] = '00';
        //     total_withhold = (+(total_withhold) + 0.0000001).toString();
        // }

        // this.createForm.patchValue({ "total_withhold": total_withhold })
        this.getwithhold();

    }
    onChangeFactorRateSlider() {
        this.lenderSubmitDisabled = true;
        this.createForm.patchValue({ "sell_rate": this.factorratevalue.toFixed() });
        if (Number(this.createForm.value.sell_rate) > this.sliderDetails?.max_factor_rate) {
            this.commonService.showError("Please enter value less than or equal to " + this.sliderDetails?.max_factor_rate)
            this.createForm.patchValue({ sell_rate: 0 });
            this.factorratevalue = 0
        } else if (Number(this.createForm.value.sell_rate) < Number(this.createForm.value.buy_rate)) {
            this.commonService.showError("Sell rate can't be less than buy rate")
            this.createForm.patchValue({ sell_rate: 0 });
            this.createForm.patchValue({ buy_rate: '' })
            this.factorratevalue = 0
        } else {
            if (this.createForm.value.sell_rate && this.createForm.value.points) {
                let buyRate = 0;
                buyRate = Number(this.createForm.value.sell_rate) - Number(this.createForm.value.points) / 100;
                // this.createForm.patchValue({ buy_rate: buyRate.toFixed(3) });
                if (this.decimalPlaces(this.createForm.value.sell_rate) == 0) {
                    this.createForm.patchValue({ buy_rate: buyRate.toFixed(2) });
                } else {
                    this.createForm.patchValue({ buy_rate: buyRate.toFixed(this.decimalPlaces(this.createForm.value.sell_rate)) });
                }

            }
            let total_value = 0;
            total_value = Number(this.createForm.value.funding_amount) * Number(this.createForm.value.sell_rate);
            this.createForm.patchValue({ rtr: total_value.toFixed(2) })
            let payment_value: any = 0;
            if (this.createForm.value.term_in_days != '') {
                payment_value = Number(this.createForm.value.rtr) / Number(this.createForm.value.term_in_days);
                payment_value = payment_value.toFixed(2);
                if (payment_value.split('.').length > 1) {
                    payment_value.split('.')[1] = '00';
                    payment_value = (+(payment_value) + 0.0000001).toString();
                }
                this.dailyPaymentvalue = payment_value
                this.createForm.patchValue({ payment: payment_value });
                let data = this.createForm.get('payment_type')?.value;
                let actual_number = 0;
                for (let x of this.preFundAdvancetype) {
                    if (data === x.id) {
                        let data = x.name;
                        if (data == 'Daily ') {
                            actual_number = 21;
                        } else if (data == 'Weekly ') {
                            // actual_number = 4;
                            actual_number = 4.20;
                        } else if (data == 'Bi-Weekly ') {
                            actual_number = 2;
                        } else if (data == 'Monthly ') {
                            actual_number = 1;
                        }
                        let withhold_value: any = 0;
                        let total_average_monthly_revenue = this.lead?.monthly_true_revenue
                        if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
                            withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
                            if (withhold_value < 1) {
                                withhold_value = (withhold_value) * 100;
                            } else {
                                withhold_value = withhold_value;
                            }
                        } else {
                            withhold_value = 0;
                        }
                        // let total_withhold: any = Number(this.lead?.total_withhold)
                        // total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
                        this.withholdvalue = withhold_value
                        withhold_value = withhold_value.toFixed(2);
                        if (withhold_value.split('.').length > 1) {
                            withhold_value.split('.')[1] = '00';
                            withhold_value = (+(withhold_value) + 0.0000001).toString();
                        }
                        // total_withhold = total_withhold.toFixed(2);
                        // if (total_withhold.split('.').length > 1) {
                        //     total_withhold.split('.')[1] = '00';
                        //     total_withhold = (+(total_withhold) + 0.0000001).toString();
                        // }
                        // this.createForm.patchValue({ "total_withhold": total_withhold })

                        this.createForm.patchValue({ "withhold": withhold_value });
                        this.getwithhold();

                    }
                }
                // this.createForm.patchValue({ payment: payment_value.toFixed(2) })
            }


        }


    }
    onChangeTermSlider() {
        this.lenderSubmitDisabled = true;
        this.createForm.patchValue({ "term_in_days": this.termvalue.toFixed() });
        let payment_value: any = 0;
        payment_value = Number(this.createForm.value.rtr) / Number(this.createForm.value.term_in_days);
        payment_value = payment_value.toFixed(2);
        this.dailyPaymentvalue = payment_value;
        if (payment_value.split('.').length > 1) {
            payment_value.split('.')[1] = '00';
            payment_value = (+(payment_value) + 0.0000001).toString();
        }
        this.createForm.patchValue({ payment: payment_value });
        let data = this.createForm.get('payment_type')?.value;
        let actual_number = 0;
        for (let x of this.preFundAdvancetype) {
            if (data === x.id) {
                let data = x.name;
                if (data == 'Daily ') {
                    actual_number = 21;
                } else if (data == 'Weekly ') {
                    // actual_number = 4;
                    actual_number = 4.20;
                } else if (data == 'Bi-Weekly ') {
                    actual_number = 2;
                } else if (data == 'Monthly ') {
                    actual_number = 1;
                }
                let withhold_value: any = 0;
                let total_average_monthly_revenue = this.lead?.monthly_true_revenue
                if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
                    withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
                    if (withhold_value < 1) {
                        withhold_value = (withhold_value) * 100;
                    } else {
                        withhold_value = withhold_value;
                    }
                } else {
                    withhold_value = 0;
                }
                // let total_withhold: any = Number(this.lead?.total_withhold)
                // total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
                this.withholdvalue = withhold_value
                withhold_value = withhold_value.toFixed(2);
                if (withhold_value.split('.').length > 1) {
                    withhold_value.split('.')[1] = '00';
                    withhold_value = (+(withhold_value) + 0.0000001).toString();
                }
                // total_withhold = total_withhold.toFixed(2);
                // if (total_withhold.split('.').length > 1) {
                //     total_withhold.split('.')[1] = '00';
                //     total_withhold = (+(total_withhold) + 0.0000001).toString();
                // }
                // this.createForm.patchValue({ "total_withhold": total_withhold })

                this.createForm.patchValue({ "withhold": withhold_value });
                this.getwithhold();

            }
        }

    }
    onChangeDailyPaymentSlider() {
        this.lenderSubmitDisabled = true;
        this.createForm.patchValue({ "payment": this.dailyPaymentvalue.toFixed() });
        const formData = this.createForm.value;
        if (formData.rtr != '' && formData.payment != '') {
            let days = Number(formData.rtr) / Number(formData.payment);
            this.termvalue = Math.round(days)
            this.createForm.patchValue({ term_in_days: Math.round(days) })
        }
        let Payment = Number(formData.payment).toFixed(2);
        if (Payment.split('.').length > 1) {
            Payment.split('.')[1] = '00';
            Payment = (+(Payment) + 0.0000001).toString();
        }
        this.createForm.patchValue({ payment: Payment });
        let data = this.createForm.get('payment_type')?.value;
        let actual_number = 0;
        for (let x of this.preFundAdvancetype) {
            if (data === x.id) {
                let data = x.name;
                if (data == 'Daily ') {
                    actual_number = 21;
                } else if (data == 'Weekly ') {
                    // actual_number = 4;
                    actual_number = 4.20;
                } else if (data == 'Bi-Weekly ') {
                    actual_number = 2;
                } else if (data == 'Monthly ') {
                    actual_number = 1;
                }
                let withhold_value: any = 0;
                let total_average_monthly_revenue = this.lead?.monthly_true_revenue
                if (this.createForm.get('payment')?.value || total_average_monthly_revenue) {
                    withhold_value = (this.createForm.get('payment')?.value * actual_number) / total_average_monthly_revenue;
                    if (withhold_value < 1) {
                        withhold_value = (withhold_value) * 100;
                    } else {
                        withhold_value = withhold_value;
                    }
                } else {
                    withhold_value = 0;
                }
                // let total_withhold: any = Number(this.lead?.total_withhold)
                // total_withhold = Number(this.lead?.total_withhold) + Number(withhold_value);
                this.withholdvalue = withhold_value;
                withhold_value = withhold_value.toFixed(2);
                if (withhold_value.split('.').length > 1) {
                    withhold_value.split('.')[1] = '00';
                    withhold_value = (+(withhold_value) + 0.0000001).toString();
                }
                // total_withhold = total_withhold.toFixed(2);
                // if (total_withhold.split('.').length > 1) {
                //     total_withhold.split('.')[1] = '00';
                //     total_withhold = (+(total_withhold) + 0.0000001).toString();
                // }
                // this.createForm.patchValue({ "total_withhold": total_withhold })

                this.createForm.patchValue({ "withhold": withhold_value });
                this.getwithhold();

            }
        }

    }
    changePoints() {
        let buyRate = 0;
        buyRate = Number(this.createForm.value.sell_rate) - Number(this.createForm.value.points) / 100;
        // this.createForm.patchValue({ buy_rate: buyRate.toFixed(3) });
        if (this.decimalPlaces(this.createForm.value.sell_rate) == 0) {
            this.createForm.patchValue({ buy_rate: buyRate.toFixed(2) });
        } else {
            this.createForm.patchValue({ buy_rate: buyRate.toFixed(this.decimalPlaces(this.createForm.value.sell_rate)) });
        }

        //Retail points set value
        this.createForm.patchValue({ retail_points: this.createForm.value.points })


    }
    getDecimal(val: any) {
        return Number(val).toFixed(2)
    }
    async getSliderDetails(): Promise<void> {
        try {
            this.commonService.showSpinner();
            let url = '';
            if (Roles.ADMINISTRATOR) {
                url = `?company_id=${this.lead.company_id}`;
            }
            const res$ = this.apiService.getReq(API_PATH.GET_SLIDER_SETTINGS + url, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.sliderDetails = response.data;
                this.fundingoptions = {
                    floor: 0,
                    ceil: this.sliderDetails.max_funding_amount
                };
                this.withholdoptions = {
                    floor: 0,
                    ceil: this.sliderDetails.max_withhold_percentage
                };
                this.factorrateoptions = {
                    floor: 0,
                    ceil: this.sliderDetails.max_factor_rate
                };
                this.termoptions = {
                    floor: 0,
                    ceil: this.sliderDetails.max_term_in_days
                };
                this.dailyPaymentoptions = {
                    floor: 0,
                    ceil: this.sliderDetails.max_daily_payment
                };
                // this.patchValues();

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
    // document
    async getDocumentTypes() {
        try {
            const res$ = this.apiService.getReq(API_PATH.DOCUMENT_TYPES, 'lead', 'document-upload');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.docTypes = response.data;
                // console.log(this.docTypes,'hhhh');

                // this.actualdocTypes = response.data
            }
        } catch (error) {
            this.commonService.showErrorMessage(error);
        }
    }
    /**
     * @BuyRate Digit manage 3/7/23
     */
    decimalPlaces(num: any) {
        let match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) { return 0; }
        return Math.max(
            0,
            // Number of digits right of decimal point.
            (match[1] ? match[1].length : 0)
            // Adjust for scientific notation.
            - (match[2] ? +match[2] : 0));
    }

    ngAfterContentChecked() {
        this.cdr.detectChanges();
    }
    async getISOList() {
        try {
            let url = '';
            // if (this.userRole == Roles.ADMINISTRATOR) {
            //     url = `?company_id=${this.companyID}`;
            // }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST + url, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lenderList = response.data.iso;
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
    async checkEmailTemplateExists(actionType: any) {
        this.commonService.showSpinner();
        try {
            const res$ = this.apiService.postReq(API_PATH.LEAD_EMAIL_TEMPLATE_EXIST, { lead_id: this.leadID, action_type: actionType }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (actionType == 'Funded Lender Offer') {
					this.createForm.get('funded_rejected')?.setValue('funded');
					this.createForm.get('apply_to_function')?.setValue(true);
                } else if(actionType == 'Rejected Lender Offer'){
					this.createForm.get('apply_to_function')?.setValue(false);
                } else if(actionType == 'Accepted Lender Offer'){
					this.createForm.get('apply_to_function')?.setValue(false);
                }

            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error?.error?.data.already_exist == 0) {
				this.createForm.patchValue({funded_rejected: ""});
				this.createForm.get('apply_to_function')?.setValue(false);
                Swal.fire({
                    title: error?.error?.message,
                    icon: 'warning',
                    // showCancelButton: true,
                    confirmButtonText: 'OK',
                    confirmButtonColor: this.color,
                }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        Swal.close();
					

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
}