import { Component, OnInit, Inject, LOCALE_ID, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { formatCurrency } from '@angular/common';
import moment from 'moment';
import { Options } from '@angular-slider/ngx-slider';
import * as Constants from '@constants/constants';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    selector: 'app-lender-offer-update',
    templateUrl: './lender-offer-update.component.html',
    styleUrls: ['./lender-offer-update.component.scss']
})
export class LenderOfferUpdateComponent implements OnInit {
    companyType: string = '';
    fundingvalue: number = 0;
    fundingoptions: Options = {
        floor: 0,
        ceil: 10000000,
        readOnly: true
    };

    withholdvalue: number = 0;
    withholdoptions: Options = {
        floor: 0,
        ceil: 100,
        readOnly: true
    };

    factorratevalue: number = 0;
    factorrateoptions: Options = {
        floor: 0,
        ceil: 100
    };

    termvalue: number = 0;
    termoptions: Options = {
        floor: 0,
        ceil: 1000000,
        readOnly: true
    };

    dailyPaymentvalue: number = 0;
    dailyPaymentoptions: Options = {
        floor: 0,
        ceil: 10000000,
        readOnly: true
    };


    activeTab: string = 'Create';
    createForm!: FormGroup;
    preFundForm!: FormGroup;
    lenderList: Array<any> = [];
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
    termLables: string = 'Days';
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    conditionCheck: boolean = false;
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
    token: string = '';
    filesForm: FormGroup | any;
    selectedFiles: Array<File> = [];
    nowDate!: string;
    uploading: boolean = false;
    documentsList: Array<any> = [];
    page: number = 1;
    search: string = '';
    limit: number = 10;
    selectedDate: string = '';
    hasMoreDocs: boolean = false;
    finalExistingWithhold: number = 0;
    selectedDocuments: any;
    range: any = [];
    startYear = new Date().getFullYear();
    documentDateCheck = new Date();


    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private calendar: NgbCalendar,
        @Inject(LOCALE_ID) public locale: string,
        private ngxLoader: NgxUiLoaderService,

    ) { }

    ngOnInit(): void {
        this.documentYear();
        this.maxDate = this.calendar.getToday();
        let d = new Date();
        let day: any = d.getDate();
        if (day.toString().length < 2) {
            day = '0' + day;
        }
        let month:string|number = (d.getMonth() + 1);
        if (month.toString().length < 2) {
            month = '0' + month;
        }
        this.nowDate = `${month}-${day}-${d.getFullYear()}`
        // this.nowDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
        this.initCreateForm();
        this.initForm();
        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        let queryParams = this.route.snapshot.queryParams;
        if (params['id']) {
            this.lenderOfferID = params['id'];
            if (queryParams && queryParams['token']) {
                this.token = queryParams['token'];
                this.getSliderDetails();
                this.getDocumentTypes();
                this.getDropdownOptions();
                this.getLenderOptions();
                this.getfcsDetail();
                this.getLenderOfferData();
                this.getLenderDocuments();
            }

        }

        if (query['mode'] && query['mode'] === 'edit') {
            this.editMode = true;
        }
        this.getUserDetails();
        this.canEditLenderOffer = this.authService.hasPermission('lender-offer-update');
        // this.updatePermission();
    }
    updatePermission() {
        this.canViewLenderOffers = this.authService.hasPermission('lender-offer-list');

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
                // console.log("bjb", ud);


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
            for (let x of this.preFundAdvancetype) {
                if (data === x.id) {
                    let data = x.name;
                    if (data == 'Daily ') {
                        actual_number = 21;
                        this.termLables = 'Days'
                        this.paymentLabels = 'Daily'
                    } else if (data == 'Weekly ') {
                        actual_number = 4;
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
                    let total_average_monthly_revenue = this.lenderOffer?.monthly_true_revenue
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
                    // let total_withhold: any = Number(this.lenderOffer?.total_withhold)
                    // total_withhold = Number(this.lenderOffer?.total_withhold) + Number(withhold_value);
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

    getFundValue() {
        let fund = this.createForm.get('funded_rejected')?.value;
        if (fund == 'funded') {
            this.createForm.get('apply_to_function')?.setValue(true);
            this.conditionCheck = true;
        } else {
            this.createForm.get('apply_to_function')?.setValue(false);
            this.conditionCheck = false;


        }



    }
    getCheckedFund() {
        let data = this.createForm.get('apply_to_function')?.value;

        if (data === true) {
            this.createForm.get('funded_rejected')?.setValue('funded');
            this.conditionCheck = true;

        } else {
            this.conditionCheck = false;

            this.createForm.get('funded_rejected')?.setValue('');
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
            withhold: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
            total_withhold: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
            documents: [''],
            notes_for_stips: [''],
            placeholder: [''],
            add_stips: this.fb.array([]),
        });
        // this.addAdditionalStips();

        if (this.createForm.value.apply_to_function === true) {
            this.conditionCheck = true;
        } else {
            this.conditionCheck = false;
        }
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
                if(this.decimalPlaces(this.createForm.value.sell_rate) == 0){
					this.createForm.patchValue({ buy_rate: buyRate.toFixed(2) });
					} else{
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
                            actual_number = 4;
                        } else if (data == 'Bi-Weekly ') {
                            actual_number = 2;
                        } else if (data == 'Monthly ') {
                            actual_number = 1;
                        }
                        let withhold_value: any = 0;
                        let total_average_monthly_revenue = this.lenderOffer?.monthly_true_revenue
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
                        // let total_withhold: any = Number(this.lenderOffer?.total_withhold)
                        // total_withhold = Number(this.lenderOffer?.total_withhold) + Number(withhold_value);
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
                        this.getwithhold()

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
                        actual_number = 4;
                    } else if (data == 'Bi-Weekly ') {
                        actual_number = 2;
                    } else if (data == 'Monthly ') {
                        actual_number = 1;
                    }
                    let withhold_value: any = 0;
                    let total_average_monthly_revenue = this.lenderOffer?.monthly_true_revenue
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
                    // let total_withhold: any = Number(this.lenderOffer?.total_withhold)
                    // total_withhold = Number(this.lenderOffer?.total_withhold) + Number(withhold_value);
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
                    this.getwithhold()

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
                    actual_number = 4;
                } else if (data == 'Bi-Weekly ') {
                    actual_number = 2;
                } else if (data == 'Monthly ') {
                    actual_number = 1;
                }
                let withhold_value: any = 0;
                let total_average_monthly_revenue = this.lenderOffer?.monthly_true_revenue
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
                // let total_withhold: any = Number(this.lenderOffer?.total_withhold)
                // total_withhold = Number(this.lenderOffer?.total_withhold) + Number(withhold_value);
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
                this.getwithhold()
            }
        }
    }

    patchValues(): void {
        let data = formatCurrency(this.lenderOffer?.funding_amount, this.locale, '');
        setTimeout(() => {
            let obj = this.pointsList.filter(e => e.id == this.lenderOffer?.points);
            this.createForm.patchValue({
                points: obj[0]?.name,
            })

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
            buy_rate: this.lenderOffer?.buy_rate,
            position: this.lenderOffer?.position,
            funded_rejected: this.lenderOffer?.funding_rejected,
            apply_to_function: this.lenderOffer?.apply_to_function,
            withhold: this.lenderOffer?.withhold,
            total_withhold: Number(this.lenderOffer?.total_withhold).toFixed(2),
            documents: this.lenderOffer?.all_documents,
            notes_for_stips: this.lenderOffer?.notes_for_stips,
            placeholder: this.lenderOffer?.placeholder,
            points: this.lenderOffer?.points,
        });
        this.selectedDocuments = this.lenderOffer?.documents
        this.createForm.controls['documents'].disable();
        if (this.lenderOffer?.apply_to_function === true) {
            this.conditionCheck = true;
        } else {
            this.conditionCheck = false;
        }

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

        this.getwithhold()
    }
    async getDropdownOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.VERIFY_DROPDOWN_OPTIONS, { token: this.token, group_name: ['pre_fund_type', 'pre_fund_advance_type', 'pre_fund_unit_type', 'points'] }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.preFundtype = response.data.pre_fund_type;
                this.preFundAdvancetype = response.data.pre_fund_advance_type;
                this.pointsList = response.data.points;
                let array = [];
                for (let i = 0; i < this.preFundAdvancetype.length; i++) {
                    if (i < 4) {
                        let text = this.preFundAdvancetype[i].name.toString().replace("ACH", "");
                        this.preFundAdvancetype[i].name = text;
                        array.push(this.preFundAdvancetype[i]);
                    }
                }
                this.preFundAdvancetype = array;
                this.preFundUnittype = response.data.pre_fund_unit_type;

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
            let data = {
                lender_offer_id: this.lenderOfferID,
                token: this.token
            }
            const res$ = this.apiService.postReq(API_PATH.VERIFY_LENDER_OFFER_VIEW, data, 'lender', 'offer-update');
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
            const res$ = this.apiService.postReq(API_PATH.VERIFY_LENDER_LIST, { token: this.token }, '', '');
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
                lead_id: this.lenderOffer?.lead_id,
                update: "update",
                token: this.token,
                documents: this.selectedDocuments,
                payment_type_name:this.termLables
            }
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.VERIFY_LENDER_OFFER_UPDATE, data, 'lender', 'offer-update');
                let response = await lastValueFrom(res$);
                if (response.api_response == 'success') {
                    this.commonService.showSuccess(response.message);
                    this.redirect();
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
    redirect() {
        this.router.navigate(['/syndicate-submitted/' + this.token], { queryParams: { type: 'lenderoffer' } });
    }
    cancel() {
        this.editMode = !this.editMode;
        this.patchValues();
    }
    // getLeadBasicDetails(leadData: any) {
    //     this.lead = leadData;
    //     this.getSliderDetails();
    //     // this.createForm.patchValue({ total_withhold: this.lead.total_withhold })

    // }
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
                        actual_number = 4;
                    } else if (data == 'Bi-Weekly ') {
                        actual_number = 2;
                    } else if (data == 'Monthly ') {
                        actual_number = 1;
                    }
                    let withhold_value: any = 0;
                    let total_average_monthly_revenue = this.lenderOffer?.monthly_true_revenue
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
                    // let total_withhold: any = Number(this.lenderOffer?.total_withhold)
                    // total_withhold = Number(this.lenderOffer?.total_withhold) + Number(withhold_value);
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
                    this.getwithhold()
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
        // let total_withhold: any = Number(this.lenderOffer?.total_withhold)
        // total_withhold = Number(this.lenderOffer?.total_withhold) + Number(this.createForm.value.withhold);
        // total_withhold = total_withhold.toFixed(2);
        // if (total_withhold.split('.').length > 1) {
        //     total_withhold.split('.')[1] = '00';
        //     total_withhold = (+(total_withhold) + 0.0000001).toString();
        // }

        // this.createForm.patchValue({ "total_withhold": total_withhold })
        this.getwithhold()

    }

    //lender section
    //lender section
    async getfcsDetail() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.VERIFY_ACTIVE_LENDER_LIST, { token: this.token }, 'lender', 'offer-update');
            const response = await lastValueFrom(res$);
            if (response && response.data) {
                this.fcsDetailList = response.data;
                // this.withHoldValue =Number(this.fcsDetailList?.withholding_percentage).toFixed(2);
                this.activelenderList = response.data.lender;
                for (let index = 0; index < this.activelenderList.length; index++) {
                    this.existingWithhold += Number(this.activelenderList[index].with_hold);

                }
                this.getwithhold()
                // this.activelenderList = response.data.syndicates.map((e: any) => ({ ...e, selected: false }));
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

    }
    getwithhold() {
        // let sum = 0;
        // for (let index = 0; index < this.activelenderList.length; index++) {
        //     // console.log(this.activelenderList[index])
        //     if (this.activelenderList[index].status == 1) {
        //         sum += this.activelenderList[index].with_hold

        //     }

        // }
        // let total_withhold = Number(this.createForm.value.withhold) + sum;
        // this.createForm.patchValue({ "total_withhold": total_withhold })
        let activeSum = 0;
        let inactiveSum = 0;
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
        this.finalExistingWithhold = this.existingWithhold - activeSum;

    }
    async getactiveLender(status: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.VERIFY_LENDER_UPDATE_STATUS, { token: this.token, id: this.lenderIdArray, status: status }, 'lender', 'offer-update');
            const response = await lastValueFrom(res$);
            if (response) {
                let index = this.activelenderList.findIndex((e) => { e.id === this.lenderIdArray });
                if (index > -1) {
                    this.activelenderList[index].status = status
                }
                this.commonService.showSuccess(response.message);
                this.getwithhold();
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
                        actual_number = 4;
                    } else if (data == 'Bi-Weekly ') {
                        actual_number = 2;
                    } else if (data == 'Monthly ') {
                        actual_number = 1;
                    }
                    let withhold_value: any = 0;
                    let total_average_monthly_revenue = this.lenderOffer?.monthly_true_revenue
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
                    // let total_withhold: any = Number(this.lenderOffer?.total_withhold)
                    // total_withhold = Number(this.lenderOffer?.total_withhold) + Number(withhold_value);
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
                    this.getwithhold()

                }
            }
            // this.createForm.patchValue({ payment: payment_value.toFixed(2) })
        }

    }

    onChangeWithholdSlider() {
        this.createForm.patchValue({ "withhold": this.withholdvalue.toFixed() });
        // let total_withhold: any = Number(this.lenderOffer?.total_withhold)
        // total_withhold = Number(this.lenderOffer?.total_withhold) + Number(this.createForm.value.withhold);
        // total_withhold = total_withhold.toFixed(2);
        // if (total_withhold.split('.').length > 1) {
        //     total_withhold.split('.')[1] = '00';
        //     total_withhold = (+(total_withhold) + 0.0000001).toString();
        // }

        // this.createForm.patchValue({ "total_withhold": total_withhold })
        this.getwithhold()

    }
    onChangeFactorRateSlider() {
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
                if(this.decimalPlaces(this.createForm.value.sell_rate) == 0){
					this.createForm.patchValue({ buy_rate: buyRate.toFixed(2) });
					} else{
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
                            actual_number = 4;
                        } else if (data == 'Bi-Weekly ') {
                            actual_number = 2;
                        } else if (data == 'Monthly ') {
                            actual_number = 1;
                        }
                        let withhold_value: any = 0;
                        let total_average_monthly_revenue = this.lenderOffer?.monthly_true_revenue
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
                        // let total_withhold: any = Number(this.lenderOffer?.total_withhold)
                        // total_withhold = Number(this.lenderOffer?.total_withhold) + Number(withhold_value);
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
                        this.getwithhold()

                    }
                }
                // this.createForm.patchValue({ payment: payment_value.toFixed(2) })
            }


        }


    }
    onChangeTermSlider() {
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
                    actual_number = 4;
                } else if (data == 'Bi-Weekly ') {
                    actual_number = 2;
                } else if (data == 'Monthly ') {
                    actual_number = 1;
                }
                let withhold_value: any = 0;
                let total_average_monthly_revenue = this.lenderOffer?.monthly_true_revenue
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
                // let total_withhold: any = Number(this.lenderOffer?.total_withhold)
                // total_withhold = Number(this.lenderOffer?.total_withhold) + Number(withhold_value);
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
                this.getwithhold()

            }
        }

    }
    onChangeDailyPaymentSlider() {
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
                    actual_number = 4;
                } else if (data == 'Bi-Weekly ') {
                    actual_number = 2;
                } else if (data == 'Monthly ') {
                    actual_number = 1;
                }
                let withhold_value: any = 0;
                let total_average_monthly_revenue = this.lenderOffer?.monthly_true_revenue
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
                // let total_withhold: any = Number(this.lenderOffer?.total_withhold)
                // total_withhold = Number(this.lenderOffer?.total_withhold) + Number(withhold_value);
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
                this.getwithhold()

            }
        }

    }
    changePoints() {
        let buyRate = 0;
        buyRate = Number(this.createForm.value.sell_rate) - Number(this.createForm.value.points) / 100;
        // this.createForm.patchValue({ buy_rate: buyRate.toFixed(3) });
        if(this.decimalPlaces(this.createForm.value.sell_rate) == 0){
            this.createForm.patchValue({ buy_rate: buyRate.toFixed(2) });
            } else{
            this.createForm.patchValue({ buy_rate: buyRate.toFixed(this.decimalPlaces(this.createForm.value.sell_rate)) });
            }

    }
    getDecimal(val: any) {
        return Number(val).toFixed(2)
    }
    async getSliderDetails(): Promise<void> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.VERIFY_LENDER_SLIDER_LIST, { token: this.token }, 'lender', 'offer-update');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.sliderDetails = response.data;
                this.fundingoptions = {
                    floor: 0,
                    ceil: this.sliderDetails.max_funding_amount,
                    readOnly: true
                };
                this.withholdoptions = {
                    floor: 0,
                    ceil: this.sliderDetails.max_withhold_percentage,
                    readOnly: true
                };
                this.factorrateoptions = {
                    floor: 0,
                    ceil: this.sliderDetails.max_factor_rate,
                };
                this.termoptions = {
                    floor: 0,
                    ceil: this.sliderDetails.max_term_in_days,
                    readOnly: true
                };
                this.dailyPaymentoptions = {
                    floor: 0,
                    ceil: this.sliderDetails.max_daily_payment,
                    readOnly: true
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
            let data = {
                token: this.token,
                lender_offer_id: this.lenderOfferID
            }
            const res$ = this.apiService.postReq(API_PATH.VERIFY_LENDER_OFFER_DOC_TYPES, data, 'lender', 'offer-update');
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
 * 
 * @param files 
 */
    onFileChange(files: File[], input: any) {
        this.selectedFiles = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].size / 1024 / 1024 > 30) {
                this.commonService.showError('Maximum file size allowed is 30MB');
            } else if (!Constants.SETTINGS.ALLOWED_FILES.includes(files[i].type)) {
                this.commonService.showError('Invalid file type. Allowed file type are - gif|jpeg|png|txt|doc|docx|xlsx|xls|pdf|wav|mp3');
            } else {
                // this.selectedFiles.push(files[i]);
                this.addFileToForm(files[i])
            }
        }
        input.value = '';
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
            doc_type: ['', [Validators.required]],
            // doc_type: ['other'],
            // doc_name: ['', [ 
            //     Validators.required, 
            //     Validators.pattern(Constants.Custom_Regex.spaces), 
            //     Validators.minLength(3), 
            //     Validators.maxLength(100),
            //     Validators.pattern(Constants.Custom_Regex.username),
            //     Validators.pattern(Constants.Custom_Regex.name)
            // ]],
            doc_name: [''],
            // document_date: [null],
            document_month:[''],
            document_year:[''],
            doc_note: [''],
            file: [file]
        }))
    }

    removeFileFromArray(i: number) {
        this.formFileArray.removeAt(i);
    }
    documentDate() {
        this.initOwnerDob();
    }
    initOwnerDob() {
        for (let i = 0; i < this.formFileArray.length; i++) {
            let data = document.getElementById(`${i}`);
            if (data) {
                Inputmask('datetime', {
                    inputFormat: 'mm-dd-yyyy',
                    placeholder: 'mm-dd-yyyy',
                    alias: 'datetime',
                    min: '01-01-1920',
                    max: this.nowDate,
                    clearMaskOnLostFocus: false,
                }).mask(data);
            }

        }
        // if (this.ownerDob) {
        //     Inputmask('datetime', {
        //         inputFormat: 'mm-dd-yyyy',
        //         placeholder: 'mm-dd-yyyy',
        //         alias: 'datetime',
        //         min: '01-01-1920',
        //         max: this.nowDate,
        //         clearMaskOnLostFocus: false,
        //     }).mask(this.ownerDob.nativeElement);
        // }
    }
    ngAfterViewInit(): void {
        this.initOwnerDob();
    }
    getDocType(val: string): string {
        // let v = this.actualdocTypes.find(e => e.value === val);
        let v = this.docTypes.find((e: any) => e.value === val);
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
            // this.initOwnerDob();
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

    async uploadDocuments() {
        try {
            // let arr = [];
            if (this.formFileArray.length) {
                for (let i = 0; i < this.formFileArray.length; i++) {
                    // arr.push(this.filesForm.get('files')['controls'][i].controls.doc_type.value);
                    // if (this.filesForm.get('files')['controls'][i].controls.document_date.value && !Constants.Custom_Regex.date.test(this.filesForm.get('files')['controls'][i].controls.document_date.value)) {
                    //     this.commonService.showError('Invalid document date.');
                    //     this.uploading = false;
                    //     this.commonService.hideSpinner();
                    //     return;
                    // }

                    if (this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_bank_statement' || this.filesForm.get('files')['controls'][i].controls.doc_type.value == '3month_cc_statement') {
                        // this.filesForm.get('files')['controls'][i].controls.document_date.setValidators(Validators.required);
                        // this.filesForm.get('files')['controls'][i].controls.document_date.updateValueAndValidity();
                        // this.filesForm.get('files')['controls'][i].controls.document_date.markAsTouched();
                        this.filesForm.get('files')['controls'][i].controls.document_month.setValidators(Validators.required);
                        this.filesForm.get('files')['controls'][i].controls.document_month.updateValueAndValidity();
                        this.filesForm.get('files')['controls'][i].controls.document_month.markAsTouched();

                        this.filesForm.get('files')['controls'][i].controls.document_year.setValidators(Validators.required);
                        this.filesForm.get('files')['controls'][i].controls.document_year.updateValueAndValidity();
                        this.filesForm.get('files')['controls'][i].controls.document_year.markAsTouched();

                        this.filesForm.get('files')['controls'][i].controls.doc_note.setValidators(Validators.pattern(Constants.Custom_Regex.spaces));
                        this.filesForm.get('files')['controls'][i].controls.doc_note.updateValueAndValidity();
                        this.filesForm.get('files')['controls'][i].controls.doc_note.markAsTouched();
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
                    formData.append('lead_id', this.lenderOffer?.lead_id);
                    formData.append('token', this.token);
                    // this.uploading = true;

                    this.ngxLoader.startLoader('r1');
                    const res$ = this.apiService.postReq(API_PATH.VERIFY_LENDER_UPLOAD_DOC, formData, 'lender', 'offer-update');
                    const response = await lastValueFrom(res$);
                    if (response && response.status_code == "200") {
                        this.commonService.showSuccess(response.message);
                        // throw Error("etc")
                        // for (let i = 0; i < this.formFileArray.value.length; i++) {
                        //     if (this.formFileArray.value[i].doc_type != 'other') {
                        //         this.docTypes = this.docTypes.filter(e => e.value != this.formFileArray.value[i].doc_type);
                        //     }
                        // }
                        this.uploading = false;
                        this.ngxLoader.stopLoader('r1');
                        this.search = '';
                        this.page = 1;
                        // this.selectedDate = '';
                        this.formFileArray.clear();
                        this.getLenderDocuments();
                        // this.leadDocument.emit();
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
        } catch (error: any) {
            this.uploading = false;
            this.commonService.hideSpinnerWithId('uploading');
            this.commonService.hideSpinner();
            this.ngxLoader.stopLoader('r1');
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
                this.ngxLoader.stopLoader('r1');
            } else {
                this.commonService.showError(error.message);
                this.ngxLoader.stopLoader('r1');
            }
        }
    }

    async getLenderDocuments() {
        try {
            this.commonService.showSpinner();
            let reqData: any = {
                lead_id: this.lenderOffer?.lead_id,
                page: this.page,
                records_per_page: this.limit,
                token: this.token
            }
            // if (this.search) {
            //     reqData.name = this.search;
            // }
            // if (this.selectedDate) {
            //     // reqData.date = this.selectedDate;
            //       reqData.daterange_filter = this.selectedDate;

            // }
            const res$ = this.apiService.postReq(API_PATH.VERIFY_LENDER_UPLOADED_DOC_LIST, reqData, 'lender', 'offer-update');
            let response = await lastValueFrom(res$);
            if (response && response.data && response.status_code == "200") {
                if (this.page === 1) {
                    this.documentsList = response.data.documents;
                    this.documentsList.forEach((object) => { object.toggle = false });
                } else {
                    this.documentsList = [...this.documentsList, ...response.data.documents];
                }
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

    /**
* @description delete document
* @param docId 
*/
    async deleteDoc(docId: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.VERIFY_LENDER_DOC_DELETE, { token: this.token, document_id: docId }, 'lender', 'offer-update');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                // let data = this.documentsList.filter((e) => e.document_id == docId);
                // if (data[0].document_type != 'other') {
                //     let data2 = this.actualdocTypes.filter((e) => e.value == data[0].document_type);
                //     this.docTypes.push(data2[0])
                // }
                this.documentsList = this.documentsList.filter(e => e.document_id !== docId);


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
    async downloadFile(doc: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.VERIFY_LENDER_DOWNLOAD_DOC, { token: this.token, file: doc.actual_name }, 'lender', 'offer-update', 'arraybuffer');
            const response = await lastValueFrom(res$);
            const arrayBufferView = new Uint8Array(response);
            const file = new Blob([arrayBufferView], { type: doc.document_type });
            let url = window.URL.createObjectURL(file);
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
            a.download = doc.actual_name;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error)
        }
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
      /**
	 * @BuyRate Digit manage 3/7/23
	 */
      decimalPlaces(num:any) {
        let match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) { return 0; }
        return Math.max(
             0,
             // Number of digits right of decimal point.
             (match[1] ? match[1].length : 0)
             // Adjust for scientific notation.
             - (match[2] ? +match[2] : 0));
      }
    

}