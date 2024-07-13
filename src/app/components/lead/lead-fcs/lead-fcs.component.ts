import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import FileSaver from 'file-saver';
import moment from 'moment';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import swal from 'sweetalert2';

@Component({
    selector: 'app-lead-fcs',
    templateUrl: './lead-fcs.component.html',
    styleUrls: ['./lead-fcs.component.scss'],
})

export class LeadFcsComponent implements OnInit {
    bankForm!: FormGroup;
    lenderForm!: FormGroup;
    statesList: any[] = [];
    leadId: string = '';
    todayDate!: NgbDateStruct;
    maxDate!: NgbDateStruct;
    currentDate: string = ''
    fcsDetails: any = {};
    fetchedFCS: boolean = false;
    @ViewChildren('dps') dps!: QueryList<any>;
    canGetFCS: boolean = false;
    uploading: boolean = false;
    userRole: string = '';
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    // adjustmentIndex: number = 0;
    monthlyTrueRvenueIndex: number = 0;
    dateFormat: string = '';
    timeZone: string = '';
    @ViewChild('i', { static: false }) DBStarted!: ElementRef;
    @Input() leadDetails: any = {};
    @Output() leadFcsSubmit = new EventEmitter<any>();
    companyType: string = '';
    // labelName:string = 'Daily';



    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private calender: NgbCalendar,
        private formatter: NgbDateParserFormatter,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private ngxLoader: NgxUiLoaderService,
        private changeDetectorRef: ChangeDetectorRef,

    ) { }

    ngOnInit(): void {
        let d = new Date();
        let day: any = d.getDate();
        if (day.toString().length < 2) {
            day = '0' + day;
        }
        let month: string | number = (d.getMonth() + 1);
        if (month.toString().length < 2) {
            month = '0' + month;
        }
        this.currentDate = `${month}-${day}-${d.getFullYear()}`
        // this.currentDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
        this.canGetFCS = this.authService.hasPermission('fcs-get');
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadId = params['id'];
            this.getFcsDetails();
        }
        this.getUserDetails();
        this.todayDate = this.calender.getToday();
        this.maxDate = this.calender.getToday();
        this.initForm();
        this.initLenderForm();
        this.initFundDate();
        this.router.navigate([], {
            queryParams: {
                'activeTab': 'FCS',
            },
            queryParamsHandling: 'merge'
        })
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
                this.companyType = ud.company_type;
                this.userRole = ud.role;
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                this.dateFormat = ud.date_format;
                this.color = ud?.color;
                this.timeZone = ud.time_zone;
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

    /**
     * @description get states list
     * @param country_id 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */

    // getAdjustmentvalue(month: any, i: any) {
    //     let adjustment_value = 0;
    //     this.adjustmentIndex = i;
    //     adjustment_value = Number(this.bankFArray.value[i].monthly[month]) - Number(this.bankFArray.value[i].monthly_true_revenue[month]);
    //     this.adjustmentForm.patchValue({ [month]: adjustment_value });
    //     let total_average_monthly_revenue: any = 0;
    //     let monthlyArray = []
    //     for (let index = 0; index < this.bankForm.value.bank_data.length; index++) {
    //         let dataC = this.getMonthlyAverageAmount(index, 'monthly_true_revenue')
    //         monthlyArray.push(dataC)
    //     }
    //     var sumNumber = monthlyArray.reduce((acc, cur) => Number(acc) + Number(cur), 0);
    //     total_average_monthly_revenue = sumNumber
    //     let withhold_value = 0;
    //     for (let i = 0; i < this.lenderFArray.value.length; i++) {
    //         if (this.lenderFArray.value[i].daily_payments && total_average_monthly_revenue) {
    //             withhold_value = (this.lenderFArray.value[i].daily_payments * 21) / total_average_monthly_revenue;
    //             if (withhold_value < 1) {
    //                 withhold_value = (withhold_value) * 100;
    //             } else {
    //                 withhold_value = withhold_value;
    //             }
    //         } else {
    //             withhold_value = 0;
    //         }

    //         this.lenderFArray.at(i).patchValue({ "withhold": withhold_value.toFixed(2) })
    //     }

    // }
    async getStates(country_id: string) {
        try {
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
            }
        } catch (error: any) {
            this.uploading = false;
            this.commonService.hideSpinnerWithId('uploading');
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    getAdjustmentvalue(month: any, i: any) {
        let monthlytruerevenue_value:any = 0;
        this.monthlyTrueRvenueIndex = i;
        if(Number(this.bankFArray.value[i].monthly[month]) == 0 && Number(this.bankFArray.value[i].adjustment[month]) == 0){
            monthlytruerevenue_value = null;
        }else{

            monthlytruerevenue_value = Number(this.bankFArray.value[i].monthly[month]) - Number(this.bankFArray.value[i].adjustment[month]);
        }

        //8thApril 2024 R&d average zero issue
        // console.log('monthly', Number(this.bankFArray.value[i].monthly[month]), 'adjustMent',Number(this.bankFArray.value[i].adjustment[month]));
        
        // console.log('monthlytruerevenue_value',monthlytruerevenue_value);
        
        this.monthlyTrueRevenueForm.patchValue({ [month]: monthlytruerevenue_value });
        let total_average_monthly_revenue: any = 0;
        let monthlyArray = []
        for (let index = 0; index < this.bankForm.value.bank_data.length; index++) {
            let dataC = this.getMonthlyAverageAmount(index, 'monthly_true_revenue')
            monthlyArray.push(dataC)
        }
        var sumNumber = monthlyArray.reduce((acc, cur) => Number(acc) + Number(cur), 0);
        total_average_monthly_revenue = sumNumber
        let withhold_value = 0;
        for (let i = 0; i < this.lenderFArray.value.length; i++) {
            let  multiplyAmount = 4.20
            if(this.lenderFArray.value[i].payment_status == 1){
                multiplyAmount = 4.20
            }else{
                multiplyAmount = 21
            }
            if (this.lenderFArray.value[i].daily_payments && total_average_monthly_revenue) {
                withhold_value = (this.lenderFArray.value[i].daily_payments * multiplyAmount) / total_average_monthly_revenue;
                if (withhold_value < 1) {
                    withhold_value = (withhold_value) * 100;
                } else {
                    withhold_value = withhold_value;
                }
            } else {
                withhold_value = 0;
            }

            this.lenderFArray.at(i).patchValue({ "withhold": withhold_value.toFixed(2) })
        }

    }


    getMonthlyAverageAmount(i: number, key: string) {
        let total_average = 0;
        let total = 0;
        let availabeValuesCount = 0;
        let data = this.bankForm.value.bank_data[i][key];
        // console.log('bankdataFormArraymonhtly',data);
        
        for (const key in data) {
            if ((typeof (data[key]) == 'string' && data[key].length) || ((typeof (data[key]) == 'number'))) {
                // console.log(data[key],'gsdhsgd');
                
                 if (Custom_Regex.amountWithNegativePositive.test(data[key])) { // amount regex replce
                    total += parseFloat(data[key]);
                    availabeValuesCount++;
                }
            }
            // if (data[key] && Custom_Regex.amount.test(data[key])) {
            //     total += parseFloat(data[key]);
            //     availabeValuesCount++;
            // }
        }

        if (total && availabeValuesCount) {
            // console.log(total,'total',availabeValuesCount,'availableValueCount');
            
            total_average = (total / availabeValuesCount)
            return Number(total_average);


        } else {
            return '0'
        }

    }


    /**
     * @description get fcs data
     */
    async getFcsDetails() {
        try {
            this.uploading = true;
            this.ngxLoader.startLoader('fcs_loader');
            const res$ = this.apiService.postReq(API_PATH.FCS_DETAILS, { lead_id: this.leadId }, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.fcsDetails = response.data;
                this.fetchedFCS = !response.data.fetched_fcs;
                this.setBasicValues();
                this.getStates(this.fcsDetails.country_id);
                if (this.fcsDetails.bank_data && this.fcsDetails.bank_data.length) {
                    this.fcsDetails.bank_data.forEach((el: any) => {
                        this.bankFArray.push(this.fcsForm(el));
                    });
                    let monthlytruerevenue_value = 0;
                    for (let i = 0; i < this.fcsDetails.bank_data.length; i++) {
                        this.monthlyTrueRvenueIndex = i;
                        if (this.fcsDetails.bank_data[i].monthly.jan != '' || this.fcsDetails.bank_data[i].adjustment.jan != '') {
                            monthlytruerevenue_value = Number(this.fcsDetails.bank_data[i].monthly.jan) - Number(this.fcsDetails.bank_data[i].adjustment.jan);
                            this.monthlyTrueRevenueForm.patchValue({ jan: monthlytruerevenue_value });
                        }
                        if (this.fcsDetails.bank_data[i].monthly.feb != '' || this.fcsDetails.bank_data[i].adjustment.feb != '') {
                            monthlytruerevenue_value = Number(this.fcsDetails.bank_data[i].monthly.feb) - Number(this.fcsDetails.bank_data[i].adjustment.feb);
                            this.monthlyTrueRevenueForm.patchValue({ feb: monthlytruerevenue_value });
                        }
                        if (this.fcsDetails.bank_data[i].monthly.mar != '' || this.fcsDetails.bank_data[i].adjustment.mar != '') {
                            monthlytruerevenue_value = Number(this.fcsDetails.bank_data[i].monthly.mar) - Number(this.fcsDetails.bank_data[i].adjustment.mar);
                            this.monthlyTrueRevenueForm.patchValue({ mar: monthlytruerevenue_value });
                        }
                        if (this.fcsDetails.bank_data[i].monthly.apr != '' || this.fcsDetails.bank_data[i].adjustment.apr != '') {
                            monthlytruerevenue_value = Number(this.fcsDetails.bank_data[i].monthly.apr) - Number(this.fcsDetails.bank_data[i].adjustment.apr);
                            this.monthlyTrueRevenueForm.patchValue({ apr: monthlytruerevenue_value });
                        }
                        if (this.fcsDetails.bank_data[i].monthly.may != '' || this.fcsDetails.bank_data[i].adjustment.may != '') {
                            monthlytruerevenue_value = Number(this.fcsDetails.bank_data[i].monthly.may) - Number(this.fcsDetails.bank_data[i].adjustment.may);
                            this.monthlyTrueRevenueForm.patchValue({ may: monthlytruerevenue_value });
                        }
                        if (this.fcsDetails.bank_data[i].monthly.june != '' || this.fcsDetails.bank_data[i].adjustment.june != '') {
                            monthlytruerevenue_value = Number(this.fcsDetails.bank_data[i].monthly.june) - Number(this.fcsDetails.bank_data[i].adjustment.june);
                            this.monthlyTrueRevenueForm.patchValue({ june: monthlytruerevenue_value });
                        }
                        if (this.fcsDetails.bank_data[i].monthly.july != '' || this.fcsDetails.bank_data[i].adjustment.july != '') {
                            monthlytruerevenue_value = Number(this.fcsDetails.bank_data[i].monthly.july) - Number(this.fcsDetails.bank_data[i].adjustment.july);
                            this.monthlyTrueRevenueForm.patchValue({ july: monthlytruerevenue_value });
                        }
                        if (this.fcsDetails.bank_data[i].monthly.aug != '' || this.fcsDetails.bank_data[i].adjustment.aug != '') {
                            monthlytruerevenue_value = Number(this.fcsDetails.bank_data[i].monthly.aug) - Number(this.fcsDetails.bank_data[i].adjustment.aug);
                            this.monthlyTrueRevenueForm.patchValue({ aug: monthlytruerevenue_value });
                        }
                        if (this.fcsDetails.bank_data[i].monthly.sep != '' || this.fcsDetails.bank_data[i].adjustment.sep != '') {
                            monthlytruerevenue_value = Number(this.fcsDetails.bank_data[i].monthly.sep) - Number(this.fcsDetails.bank_data[i].adjustment.sep);
                            this.monthlyTrueRevenueForm.patchValue({ sep: monthlytruerevenue_value });
                        }
                        if (this.fcsDetails.bank_data[i].monthly.oct != '' || this.fcsDetails.bank_data[i].adjustment.oct != '') {
                            monthlytruerevenue_value = Number(this.fcsDetails.bank_data[i].monthly.oct) - Number(this.fcsDetails.bank_data[i].adjustment.oct);
                            this.monthlyTrueRevenueForm.patchValue({ oct: monthlytruerevenue_value });
                        }
                        if (this.fcsDetails.bank_data[i].monthly.nov != '' || this.fcsDetails.bank_data[i].adjustment.nov != '') {
                            monthlytruerevenue_value = Number(this.fcsDetails.bank_data[i].monthly.nov) - Number(this.fcsDetails.bank_data[i].adjustment.nov);
                            this.monthlyTrueRevenueForm.patchValue({ nov: monthlytruerevenue_value });
                        }
                        if (this.fcsDetails.bank_data[i].monthly.dec != '' || this.fcsDetails.bank_data[i].adjustment.dec != '') {
                            monthlytruerevenue_value = Number(this.fcsDetails.bank_data[i].monthly.dec) - Number(this.fcsDetails.bank_data[i].adjustment.dec);
                            this.monthlyTrueRevenueForm.patchValue({ dec: monthlytruerevenue_value });
                        }
                    }
                    // let adjustment_value = 0;
                    // for (let i = 0; i < this.fcsDetails.bank_data.length; i++) {
                    //     this.adjustmentIndex = i;
                    //     if (this.fcsDetails.bank_data[i].monthly.jan != '' || this.fcsDetails.bank_data[i].monthly_true_revenue.jan != '') {
                    //         adjustment_value = Number(this.fcsDetails.bank_data[i].monthly.jan) - Number(this.fcsDetails.bank_data[i].monthly_true_revenue.jan);
                    //         this.adjustmentForm.patchValue({ jan: adjustment_value });
                    //     }
                    //     if (this.fcsDetails.bank_data[i].monthly.feb != '' || this.fcsDetails.bank_data[i].monthly_true_revenue.feb != '') {
                    //         adjustment_value = Number(this.fcsDetails.bank_data[i].monthly.feb) - Number(this.fcsDetails.bank_data[i].monthly_true_revenue.feb);
                    //         this.adjustmentForm.patchValue({ feb: adjustment_value });
                    //     }
                    //     if (this.fcsDetails.bank_data[i].monthly.mar != '' || this.fcsDetails.bank_data[i].monthly_true_revenue.mar != '') {
                    //         adjustment_value = Number(this.fcsDetails.bank_data[i].monthly.mar) - Number(this.fcsDetails.bank_data[i].monthly_true_revenue.mar);
                    //         this.adjustmentForm.patchValue({ mar: adjustment_value });
                    //     }
                    //     if (this.fcsDetails.bank_data[i].monthly.apr != '' || this.fcsDetails.bank_data[i].monthly_true_revenue.apr != '') {
                    //         adjustment_value = Number(this.fcsDetails.bank_data[i].monthly.apr) - Number(this.fcsDetails.bank_data[i].monthly_true_revenue.apr);
                    //         this.adjustmentForm.patchValue({ apr: adjustment_value });
                    //     }
                    //     if (this.fcsDetails.bank_data[i].monthly.may != '' || this.fcsDetails.bank_data[i].monthly_true_revenue.may != '') {
                    //         adjustment_value = Number(this.fcsDetails.bank_data[i].monthly.may) - Number(this.fcsDetails.bank_data[i].monthly_true_revenue.may);
                    //         this.adjustmentForm.patchValue({ may: adjustment_value });
                    //     }
                    //     if (this.fcsDetails.bank_data[i].monthly.june != '' || this.fcsDetails.bank_data[i].monthly_true_revenue.june != '') {
                    //         adjustment_value = Number(this.fcsDetails.bank_data[i].monthly.june) - Number(this.fcsDetails.bank_data[i].monthly_true_revenue.june);
                    //         this.adjustmentForm.patchValue({ june: adjustment_value });
                    //     }
                    //     if (this.fcsDetails.bank_data[i].monthly.july != '' || this.fcsDetails.bank_data[i].monthly_true_revenue.july != '') {
                    //         adjustment_value = Number(this.fcsDetails.bank_data[i].monthly.july) - Number(this.fcsDetails.bank_data[i].monthly_true_revenue.july);
                    //         this.adjustmentForm.patchValue({ july: adjustment_value });
                    //     }
                    //     if (this.fcsDetails.bank_data[i].monthly.aug != '' || this.fcsDetails.bank_data[i].monthly_true_revenue.aug != '') {
                    //         adjustment_value = Number(this.fcsDetails.bank_data[i].monthly.aug) - Number(this.fcsDetails.bank_data[i].monthly_true_revenue.aug);
                    //         this.adjustmentForm.patchValue({ aug: adjustment_value });
                    //     }
                    //     if (this.fcsDetails.bank_data[i].monthly.sep != '' || this.fcsDetails.bank_data[i].monthly_true_revenue.sep != '') {
                    //         adjustment_value = Number(this.fcsDetails.bank_data[i].monthly.sep) - Number(this.fcsDetails.bank_data[i].monthly_true_revenue.sep);
                    //         this.adjustmentForm.patchValue({ sep: adjustment_value });
                    //     }
                    //     if (this.fcsDetails.bank_data[i].monthly.oct != '' || this.fcsDetails.bank_data[i].monthly_true_revenue.oct != '') {
                    //         adjustment_value = Number(this.fcsDetails.bank_data[i].monthly.oct) - Number(this.fcsDetails.bank_data[i].monthly_true_revenue.oct);
                    //         this.adjustmentForm.patchValue({ oct: adjustment_value });
                    //     }
                    //     if (this.fcsDetails.bank_data[i].monthly.nov != '' || this.fcsDetails.bank_data[i].monthly_true_revenue.nov != '') {
                    //         adjustment_value = Number(this.fcsDetails.bank_data[i].monthly.nov) - Number(this.fcsDetails.bank_data[i].monthly_true_revenue.nov);
                    //         this.adjustmentForm.patchValue({ nov: adjustment_value });
                    //     }
                    //     if (this.fcsDetails.bank_data[i].monthly.dec != '' || this.fcsDetails.bank_data[i].monthly_true_revenue.dec != '') {
                    //         adjustment_value = Number(this.fcsDetails.bank_data[i].monthly.dec) - Number(this.fcsDetails.bank_data[i].monthly_true_revenue.dec);
                    //         this.adjustmentForm.patchValue({ dec: adjustment_value });
                    //     }
                    // }

                } else {
                    this.bankFArray.push(this.fcsForm());
                }
                if (this.fcsDetails.lender && this.fcsDetails.lender.length) {
                    this.fcsDetails.lender.forEach((el: any) => {
                        this.lenderFArray.push(this.addLenderForm(el))
                    });
                } else {
                    this.lenderFArray.push(this.addLenderForm());
                }
            } else {
                this.commonService.showError(response.message);
            }
            this.uploading = false;
            this.ngxLoader.stopLoader('fcs_loader')

        } catch (error: any) {
            this.uploading = false;
            this.ngxLoader.stopLoader('fcs_loader')

            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }

    /**
     * @description patch values got from back-end
     */
    setBasicValues() {
        this.bankForm.patchValue({
            bussisness_date: this.formatter.parse(this.fcsDetails.business_start_date),
            state: this.fcsDetails.state_id,
            credit_score_owner: this.fcsDetails.credit_score_owner,
            credit_score_owner_2: this.fcsDetails.credit_score_owner_2,
            // ipv2score: this.fcsDetails.ipv2score,
            // fsrscore: this.fcsDetails.fsrscore,
            note: this.fcsDetails.note,
        })
    }

    initForm() {
        this.bankForm = this.fb.group({
            bussisness_date: [],
            state: [],
            credit_score_owner: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
            credit_score_owner_2: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
            // ipv2score: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
            // fsrscore: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
            note: ['', [Validators.pattern(Custom_Regex.address), Validators.pattern(Custom_Regex.address2), 
                // Validators.maxLength(1000),
                //  Validators.minLength(3)
            ]],
            bank_data: this.fb.array([])
        })
    }


    initLenderForm() {
        this.lenderForm = this.fb.group({
            lender: this.fb.array([])
        })
    }

    /**
     * 
     * @param data 
     * @returns 
     */
    addLenderForm(data: any = {}) {
        this.changeDetectorRef.detectChanges();
        setTimeout(() => {
            this.initFundDate();
        }, 0);
        // Validators.pattern(Custom_Regex.lettersOnly)
        // Validators.pattern(/^[a-zA-Z0-9-_]+$/) regex for alphanumeric and hypen
        return this.fb.group({
            name: [data.name ?? '', [Validators.pattern(Custom_Regex.spaces), Validators.maxLength(100),
                // Validators.minLength(3)
            ]],
            balance: [data.balance ?? '', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
            //this.formatter.parse() for funded-Date
            funded_date: [data.funded_date ? data.funded_date : '', [Validators.pattern(Custom_Regex.spaces)]],
            daily_payments: [data.daily_payments ?? '', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
            funded_payments: [data.funded_payments ?? '', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
            // withhold: [data.withhold ?? '', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.amount)]],
            withhold: [data.withhold ?? '', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.numberWithHypen)]],
            payment_status: [data.payment_status ? 1 : 0],
        })

    }
    calculateWithholdPercentage(i: number,status:any) {
        let multiplyAmount = 4.20
        if(status == 1){
            multiplyAmount = 4.20
        }else{
            multiplyAmount = 21
        }
        let total = 0;
        let availabeValuesCount = 0;
        // for (let index = 0; index < this.bankForm.value.bank_data.length; index++) {
        //     let data = this.bankForm.value.bank_data[index]['monthly_true_revenue'];
        //    for (const key in data) {
        //     if (data[key] && Custom_Regex.amount.test(data[key])) {
        //         total += parseFloat(data[key]);
        //         availabeValuesCount++;
        //         if (total && availabeValuesCount) {
        //             total_average_monthly_revenue = total / availabeValuesCount;                  
        //         }
        //     }
        // }

        // } 
        let total_average_monthly_revenue: any = 0;
        let monthlyArray = []
        for (let index = 0; index < this.bankForm.value.bank_data.length; index++) {
            let dataC = this.getMonthlyAverageAmount(index, 'monthly_true_revenue')
            // console.log(dataC,'monthlyRevenue');
            
            monthlyArray.push(dataC)
        }
        var sumNumber = monthlyArray.reduce((acc, cur) => Number(acc) + Number(cur), 0);
        total_average_monthly_revenue = sumNumber
        // console.log('avgrevenue',sumNumber);
        
        if (total_average_monthly_revenue) {
            let withhold_value = 0;
            withhold_value = (this.lenderFArray.at(i).value.daily_payments * multiplyAmount) / total_average_monthly_revenue;
            if (withhold_value < 1) {
                withhold_value = (withhold_value) * 100;
            } else {
                withhold_value = withhold_value;
            }
            // let withholdData  = (total_average_monthly_revenue * 21) / (this.lenderFArray.at(i).value.daily_payment);
            // withholdData.toFixed(2);
            // // new code 
            // // withhold_value = total_average_monthly_revenue /(this.lenderFArray.at(i).value.daily_payments) * 21  ;
            // withhold_value = ((this.lenderFArray.at(i).value.daily_payments * 100) * 21) / total_average_monthly_revenue;

            // code end
            // console.log('withhold_value--->',withhold_value);
            
            this.lenderFArray.at(i).patchValue({ "withhold": withhold_value.toFixed(2) })
        } else {
            this.lenderFArray.at(i).patchValue({ "withhold": 0 })
        }


    }
    // calculateWithholdPercentage(i: number, value: any) {
    //     let total = 0;
    //     let availabeValuesCount = 0;
    //     let data = this.bankForm.value.bank_data[0]['monthly_true_revenue'];
    //     for (const key in data) {
    //         if (data[key] && Custom_Regex.amount.test(data[key])) {
    //             total += parseFloat(data[key]);
    //             availabeValuesCount++;
    //         }
    //     }

    //     let total_average_monthly_revenue = 0
    //     if (total && availabeValuesCount) {
    //         total_average_monthly_revenue = total / availabeValuesCount;
    //         if (total_average_monthly_revenue) {
    //             let withhold_value = 0;
    //             // withhold_value = (this.lenderFArray.at(i).value.daily_payments * 21) / total_average_monthly_revenue;
    //             let withholdData  = (total_average_monthly_revenue * 21) / (this.lenderFArray.at(i).value.daily_payment);
    //             withholdData.toFixed(2);
    //             // new code 
    //             // withhold_value = total_average_monthly_revenue /(this.lenderFArray.at(i).value.daily_payments) * 21  ;
    //             withhold_value = ((this.lenderFArray.at(i).value.daily_payments * 100) * 21) / total_average_monthly_revenue;

    //             // code end
    //             this.lenderFArray.at(i).patchValue({ "withhold": withhold_value.toFixed(2) })
    //         } else {
    //             this.lenderFArray.at(i).patchValue({ "withhold": 0 })
    //         }
    //     } else {
    //         this.lenderFArray.at(i).patchValue({ "withhold": 0 })
    //     }


    // }

    /**
     * @description businedd lenders form array
     */
    get lenderFArray() {
        return this.lenderForm.get('lender') as FormArray;
    }
    /**
     * @description businedd banks form array
     */
    get bankFArray() {
        return this.bankForm.get('bank_data') as FormArray;
    }

    // get adjustmentForm() {
    //     return this.bankFArray.controls[this.adjustmentIndex]?.get('adjustment') as FormGroup;
    //     // return this.bankFArray.controls[0]?.get('adjustment') as FormGroup;     
    // }
    get monthlyTrueRevenueForm() {
        return this.bankFArray.controls[this.monthlyTrueRvenueIndex]?.get('monthly_true_revenue') as FormGroup;
        // return this.bankFArray.controls[0]?.get('adjustment') as FormGroup;     
    }


    /**
     * 
     * @param data 
     * @returns 
     */
    monthsFormGroup(data: any = {}, dataType: string = 'amount') {
        return this.fb.group({
            jan: [data.jan ?? '', [Validators.pattern(dataType === 'number' ? Custom_Regex.digitsOnly : Custom_Regex.numberWithHypen)]],
            feb: [data.feb ?? '', [Validators.pattern(dataType === 'number' ? Custom_Regex.digitsOnly : Custom_Regex.numberWithHypen)]],
            mar: [data.mar ?? '', [Validators.pattern(dataType === 'number' ? Custom_Regex.digitsOnly : Custom_Regex.numberWithHypen)]],
            apr: [data.apr ?? '', [Validators.pattern(dataType === 'number' ? Custom_Regex.digitsOnly : Custom_Regex.numberWithHypen)]],
            may: [data.may ?? '', [Validators.pattern(dataType === 'number' ? Custom_Regex.digitsOnly : Custom_Regex.numberWithHypen)]],
            june: [data.june ?? '', [Validators.pattern(dataType === 'number' ? Custom_Regex.digitsOnly : Custom_Regex.numberWithHypen)]],
            july: [data.july ?? '', [Validators.pattern(dataType === 'number' ? Custom_Regex.digitsOnly : Custom_Regex.numberWithHypen)]],
            aug: [data.aug ?? '', [Validators.pattern(dataType === 'number' ? Custom_Regex.digitsOnly : Custom_Regex.numberWithHypen)]],
            sep: [data.sep ?? '', [Validators.pattern(dataType === 'number' ? Custom_Regex.digitsOnly : Custom_Regex.numberWithHypen)]],
            oct: [data.oct ?? '', [Validators.pattern(dataType === 'number' ? Custom_Regex.digitsOnly : Custom_Regex.numberWithHypen)]],
            nov: [data.nov ?? '', [Validators.pattern(dataType === 'number' ? Custom_Regex.digitsOnly : Custom_Regex.numberWithHypen)]],
            dec: [data.dec ?? '', [Validators.pattern(dataType === 'number' ? Custom_Regex.digitsOnly : Custom_Regex.numberWithHypen)]],
        })

    }

    /**
     * 
     * @param i 
     * @param key 
     * @returns 
     */
    getAverageAmount(i: number, key: string) {
        let total_average = 0;
        let total = 0;
        let availabeValuesCount = 0;
        let data = this.bankForm.value.bank_data[i][key];
        for (const key in data) {
            if ((typeof (data[key]) == 'string' && data[key].length) || ((typeof (data[key]) == 'number'))) {
                //update amount regex with numberWithHypen
                if (Custom_Regex.numberWithHypen.test(data[key])) {
                    total += parseFloat(data[key]);
                    availabeValuesCount++;
                }
            }
        }
        if (total && availabeValuesCount) {
            total_average = (total / availabeValuesCount)
            if (key == 'nsf' || key == 'neg_days' || key == 'hash_of_deposit') {
                return total_average.toFixed(0);
            } else {
                return '$' + Number(total_average.toFixed(2)).toLocaleString('en-GB');
                //total_average.toFixed(2)
            }
        } else {
            return '0'
        }

    }

    getTotalAmount(i: number, key: string): string {
        try {
            let total = 0;
            let data = this.bankForm.value.bank_data[i][key];
            for (const key in data) {
                //update amount with number Hypen
                if (data[key] && Custom_Regex.numberWithHypen.test(data[key])) {
                    total += parseFloat(data[key]);
                }
            }

            if (key == 'nsf' || key == 'neg_days' || key == 'hash_of_deposit') {
                return total.toFixed(0);
                // total.toFixed(0)
            } else {
                return '$' + Number(total.toFixed(2)).toLocaleString('en-GB');
                //total.toFixed(2);
            }

        } catch (error) {
            return '0'
        }
    }

    getAverageAmountCalculate(i: number, key: string) {
        let total_average = 0;
        let total = 0;
        let availabeValuesCount = 0;
        let data = this.bankForm.value.bank_data[i][key];
        for (const key in data) {
            if ((typeof (data[key]) == 'string' && data[key].length) || ((typeof (data[key]) == 'number'))) {
                if (Custom_Regex.amountWithNegativePositive.test(data[key])) { //amount regex replcae
                    total += parseFloat(data[key]);
                    availabeValuesCount++;
                }
            }
            // if (data[key] && Custom_Regex.amount.test(data[key])) {
            //     total += parseFloat(data[key]);
            //     availabeValuesCount++;
            // }
        }

        if (total && availabeValuesCount) {
            total_average = (total / availabeValuesCount)
            if (key == 'nsf' || key == 'neg_days' || key == 'hash_of_deposit') {
                return total_average.toFixed(0);
            } else {
                return total_average.toFixed(2);
                //total_average.toFixed(2)
            }
        } else {
            return '0'
        }

    }

    /**
     * 
     * @param data 
     * @returns 
     */
    fcsForm(data: any = {}) {
        return this.fb.group({
            bank_title: [data.bank_title ?? '', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.required,
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(100),
                // Validators.minLength(3)
            ]],
            monthly: this.monthsFormGroup(data.monthly),
            adjustment: this.monthsFormGroup(data.adjustment),
            monthly_true_revenue: this.monthsFormGroup(data.monthly_true_revenue),
            average_daily: this.monthsFormGroup(data.average_daily),
            // nsf: this.monthsFormGroup(data.nsf, 'number'),
            // neg_days: this.monthsFormGroup(data.neg_days, 'number'),
            // hash_of_deposit: this.monthsFormGroup(data.hash_of_deposit, 'number'),
            nsf: this.monthsFormGroup(data.nsf),
            neg_days: this.monthsFormGroup(data.neg_days),
            hash_of_deposit: this.monthsFormGroup(data.hash_of_deposit),
            ending_balance: this.monthsFormGroup(data.ending_balance),
            total: {
                monthly: [''],
                adjustment: [''],
                monthly_true_revenue: [''],
                average_daily: [''],
                nsf: [''],
                neg_days: [''],
                hash_of_deposit: [''],
                ending_balance: [''],
            },
            average: {
                monthly: [''],
                adjustment: [''],
                monthly_true_revenue: [''],
                average_daily: [''],
                nsf: [''],
                neg_days: [''],
                hash_of_deposit: [''],
                ending_balance: ['']
            }



        })

    }
    getTotalAmountCalculate(i: number, key: string): string {
        try {
            let total = 0;
            let data = this.bankForm.value.bank_data[i][key];
            for (const key in data) {
                if (data[key] && Custom_Regex.amountWithNegativePositive.test(data[key])) { //amount replace regex
                    total += parseFloat(data[key]);
                }
            }

            if (key == 'nsf' || key == 'neg_days' || key == 'hash_of_deposit') {
                return total.toFixed(0);
                // total.toFixed(0)
            } else {
                return total.toFixed(2);
                //total.toFixed(2);
            }

        } catch (error) {
            return '0'
        }
    }

    /**
     * @description on add click for bank
     */
    addFcsForm() {
        this.bankFArray.push(this.fcsForm());
    }

    /**
     * @description on remove click for bank
     */
    removeFcsForm(i: number) {
        this.bankFArray.removeAt(i);
    }

    /**
     * @description on add click for lender
     */
    addLendersForm() {
        this.lenderFArray.push(this.addLenderForm());
        this.changeDetectorRef.detectChanges();
        setTimeout(() => {
            this.initFundDate();
        }, 0);
    }

    /**
     * @description on remove click for lender
     */
    removeLenderForm(i: number) {
        this.lenderFArray.removeAt(i);
    }

    /**
     * @description toggle datepicker
     * @param i 
     */
    toggleDatePicker(i: number) {
        try {
            let toArr = this.dps.toArray();
            toArr[i].toggle()
        } catch (error) {
            console.log(error);

        }

    }


    fetchFcsDetailsPopup() {
        swal.fire({
            title: 'Data will be verified by money thumb',
            imageUrl: './assets/images/moneythumb.png',
            imageHeight: 120,
            confirmButtonText: 'Ok',
            confirmButtonColor: this.color,
            showCancelButton: true,
            backdrop: true,
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                this.onFcsClick();
            }
        })

    }
    /**
     * @description Implement money thumb api
     */
    async onFcsClick() {
        try {
            this.commonService.showSpinner();

            const res$ = this.apiService.postReq(API_PATH.FETCH_FCS, { lead_id: this.leadId }, 'lead', 'view');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.bankFArray.clear();
                if (response.data.bank_data && response.data.bank_data.length) {
                    response.data.bank_data.forEach((el: any) => {
                        this.bankFArray.push(this.fcsForm(el))
                    });
                    let monthlytruerevenue_value = 0;
                    for (let i = 0; i < this.bankFArray.value.length; i++) {
                        this.monthlyTrueRvenueIndex = i;
                        if (this.bankFArray.value[i].monthly.jan != '' || this.bankFArray.value[i].adjustment.jan != '') {
                            monthlytruerevenue_value = Number(this.bankFArray.value[i].monthly.jan) - Number(this.bankFArray.value[i].adjustment.jan);
                            this.monthlyTrueRevenueForm.patchValue({ jan: monthlytruerevenue_value });
                        }
                        if (this.bankFArray.value[i].monthly.feb != '' || this.bankFArray.value[i].adjustment.feb != '') {
                            monthlytruerevenue_value = Number(this.bankFArray.value[i].monthly.feb) - Number(this.bankFArray.value[i].adjustment.feb);
                            this.monthlyTrueRevenueForm.patchValue({ feb: monthlytruerevenue_value });
                        }
                        if (this.bankFArray.value[i].monthly.mar != '' || this.bankFArray.value[i].adjustment.mar != '') {
                            monthlytruerevenue_value = Number(this.bankFArray.value[i].monthly.mar) - Number(this.bankFArray.value[i].adjustment.mar);
                            this.monthlyTrueRevenueForm.patchValue({ mar: monthlytruerevenue_value });
                        }
                        if (this.bankFArray.value[i].monthly.apr != '' || this.bankFArray.value[i].adjustment.apr != '') {
                            monthlytruerevenue_value = Number(this.bankFArray.value[i].monthly.apr) - Number(this.bankFArray.value[i].adjustment.apr);
                            this.monthlyTrueRevenueForm.patchValue({ apr: monthlytruerevenue_value });
                        }
                        if (this.bankFArray.value[i].monthly.may != '' || this.bankFArray.value[i].adjustment.may != '') {
                            monthlytruerevenue_value = Number(this.bankFArray.value[i].monthly.may) - Number(this.bankFArray.value[i].adjustment.may);
                            this.monthlyTrueRevenueForm.patchValue({ may: monthlytruerevenue_value });
                        }
                        if (this.bankFArray.value[i].monthly.june != '' || this.bankFArray.value[i].adjustment.june != '') {
                            monthlytruerevenue_value = Number(this.bankFArray.value[i].monthly.june) - Number(this.bankFArray.value[i].adjustment.june);
                            this.monthlyTrueRevenueForm.patchValue({ june: monthlytruerevenue_value });
                        }
                        if (this.bankFArray.value[i].monthly.july != '' || this.bankFArray.value[i].adjustment.july != '') {
                            monthlytruerevenue_value = Number(this.bankFArray.value[i].monthly.july) - Number(this.bankFArray.value[i].adjustment.july);
                            this.monthlyTrueRevenueForm.patchValue({ july: monthlytruerevenue_value });
                        }
                        if (this.bankFArray.value[i].monthly.aug != '' || this.bankFArray.value[i].adjustment.aug != '') {
                            monthlytruerevenue_value = Number(this.bankFArray.value[i].monthly.aug) - Number(this.bankFArray.value[i].adjustment.aug);
                            this.monthlyTrueRevenueForm.patchValue({ aug: monthlytruerevenue_value });
                        }
                        if (this.bankFArray.value[i].monthly.sep != '' || this.bankFArray.value[i].adjustment.sep != '') {
                            monthlytruerevenue_value = Number(this.bankFArray.value[i].monthly.sep) - Number(this.bankFArray.value[i].adjustment.sep);
                            this.monthlyTrueRevenueForm.patchValue({ sep: monthlytruerevenue_value });
                        }
                        if (this.bankFArray.value[i].monthly.oct != '' || this.bankFArray.value[i].adjustment.oct != '') {
                            monthlytruerevenue_value = Number(this.bankFArray.value[i].monthly.oct) - Number(this.bankFArray.value[i].adjustment.oct);
                            this.monthlyTrueRevenueForm.patchValue({ oct: monthlytruerevenue_value });
                        }
                        if (this.bankFArray.value[i].monthly.nov != '' || this.bankFArray.value[i].adjustment.nov != '') {
                            monthlytruerevenue_value = Number(this.bankFArray.value[i].monthly.nov) - Number(this.bankFArray.value[i].adjustment.nov);
                            this.monthlyTrueRevenueForm.patchValue({ nov: monthlytruerevenue_value });
                        }
                        if (this.bankFArray.value[i].monthly.dec != '' || this.bankFArray.value[i].adjustment.dec != '') {
                            monthlytruerevenue_value = Number(this.bankFArray.value[i].monthly.dec) - Number(this.bankFArray.value[i].adjustment.dec);
                            this.monthlyTrueRevenueForm.patchValue({ dec: monthlytruerevenue_value });
                        }
                    }
                    // let adjustment_value = 0;
                    // for (let i = 0; i < this.bankFArray.value.length; i++) {
                    //     this.adjustmentIndex = i;
                    //     if (this.bankFArray.value[i].monthly.jan != '' || this.bankFArray.value[i].monthly_true_revenue.jan != '') {
                    //         adjustment_value = Number(this.bankFArray.value[i].monthly.jan) - Number(this.bankFArray.value[i].monthly_true_revenue.jan);
                    //         this.adjustmentForm.patchValue({ jan: adjustment_value });
                    //     }
                    //     if (this.bankFArray.value[i].monthly.feb != '' || this.bankFArray.value[i].monthly_true_revenue.feb != '') {
                    //         adjustment_value = Number(this.bankFArray.value[i].monthly.feb) - Number(this.bankFArray.value[i].monthly_true_revenue.feb);
                    //         this.adjustmentForm.patchValue({ feb: adjustment_value });
                    //     }
                    //     if (this.bankFArray.value[i].monthly.mar != '' || this.bankFArray.value[i].monthly_true_revenue.mar != '') {
                    //         adjustment_value = Number(this.bankFArray.value[i].monthly.mar) - Number(this.bankFArray.value[i].monthly_true_revenue.mar);
                    //         this.adjustmentForm.patchValue({ mar: adjustment_value });
                    //     }
                    //     if (this.bankFArray.value[i].monthly.apr != '' || this.bankFArray.value[i].monthly_true_revenue.apr != '') {
                    //         adjustment_value = Number(this.bankFArray.value[i].monthly.apr) - Number(this.bankFArray.value[i].monthly_true_revenue.apr);
                    //         this.adjustmentForm.patchValue({ apr: adjustment_value });
                    //     }
                    //     if (this.bankFArray.value[i].monthly.may != '' || this.bankFArray.value[i].monthly_true_revenue.may != '') {
                    //         adjustment_value = Number(this.bankFArray.value[i].monthly.may) - Number(this.bankFArray.value[i].monthly_true_revenue.may);
                    //         this.adjustmentForm.patchValue({ may: adjustment_value });
                    //     }
                    //     if (this.bankFArray.value[i].monthly.june != '' || this.bankFArray.value[i].monthly_true_revenue.june != '') {
                    //         adjustment_value = Number(this.bankFArray.value[i].monthly.june) - Number(this.bankFArray.value[i].monthly_true_revenue.june);
                    //         this.adjustmentForm.patchValue({ june: adjustment_value });
                    //     }
                    //     if (this.bankFArray.value[i].monthly.july != '' || this.bankFArray.value[i].monthly_true_revenue.july != '') {
                    //         adjustment_value = Number(this.bankFArray.value[i].monthly.july) - Number(this.bankFArray.value[i].monthly_true_revenue.july);
                    //         this.adjustmentForm.patchValue({ july: adjustment_value });
                    //     }
                    //     if (this.bankFArray.value[i].monthly.aug != '' || this.bankFArray.value[i].monthly_true_revenue.aug != '') {
                    //         adjustment_value = Number(this.bankFArray.value[i].monthly.aug) - Number(this.bankFArray.value[i].monthly_true_revenue.aug);
                    //         this.adjustmentForm.patchValue({ aug: adjustment_value });
                    //     }
                    //     if (this.bankFArray.value[i].monthly.sep != '' || this.bankFArray.value[i].monthly_true_revenue.sep != '') {
                    //         adjustment_value = Number(this.bankFArray.value[i].monthly.sep) - Number(this.bankFArray.value[i].monthly_true_revenue.sep);
                    //         this.adjustmentForm.patchValue({ sep: adjustment_value });
                    //     }
                    //     if (this.bankFArray.value[i].monthly.oct != '' || this.bankFArray.value[i].monthly_true_revenue.oct != '') {
                    //         adjustment_value = Number(this.bankFArray.value[i].monthly.oct) - Number(this.bankFArray.value[i].monthly_true_revenue.oct);
                    //         this.adjustmentForm.patchValue({ oct: adjustment_value });
                    //     }
                    //     if (this.bankFArray.value[i].monthly.nov != '' || this.bankFArray.value[i].monthly_true_revenue.nov != '') {
                    //         adjustment_value = Number(this.bankFArray.value[i].monthly.nov) - Number(this.bankFArray.value[i].monthly_true_revenue.nov);
                    //         this.adjustmentForm.patchValue({ nov: adjustment_value });
                    //     }
                    //     if (this.bankFArray.value[i].monthly.dec != '' || this.bankFArray.value[i].monthly_true_revenue.dec != '') {
                    //         adjustment_value = Number(this.bankFArray.value[i].monthly.dec) - Number(this.bankFArray.value[i].monthly_true_revenue.dec);
                    //         this.adjustmentForm.patchValue({ dec: adjustment_value });
                    //     }
                    // }


                }
                this.fetchedFCS = false;
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


    getDate(date: any) {
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }

    async onDownloadfcsdata() {
        try {
            this.bankForm.markAllAsTouched();
            this.lenderForm.markAllAsTouched();
            // console.log("vhg", this.bankForm, this.lenderForm)
            if (this.bankForm.valid && this.lenderForm.valid) {
                for (let i = 0; i < this.lenderForm.value.lender.length; i++) {
                    if (this.lenderForm.value.lender[i].funded_date && !Custom_Regex.date.test(this.lenderForm.value.lender[i].funded_date)) {
                        this.commonService.showError('Invalid funded date.');
                        this.commonService.hideSpinner();
                        return;
                    }
                }
                for (let i = 0; i < this.bankFArray.value.length; i++) {
                    this.bankFArray.value[i].total.monthly = this.getTotalAmountCalculate(i, 'monthly'),
                        this.bankFArray.value[i].total.adjustment = this.getTotalAmountCalculate(i, 'adjustment'),
                        this.bankFArray.value[i].total.monthly_true_revenue = this.getTotalAmountCalculate(i, 'monthly_true_revenue'),
                        this.bankFArray.value[i].total.average_daily = this.getTotalAmountCalculate(i, 'average_daily'),
                        this.bankFArray.value[i].total.nsf = this.getTotalAmountCalculate(i, 'nsf'),
                        this.bankFArray.value[i].total.neg_days = this.getTotalAmountCalculate(i, 'neg_days'),
                        this.bankFArray.value[i].total.hash_of_deposit = this.getTotalAmountCalculate(i, 'hash_of_deposit'),
                        this.bankFArray.value[i].total.ending_balance = this.getTotalAmountCalculate(i, 'ending_balance'),
                        this.bankFArray.value[i].average.monthly = this.getAverageAmountCalculate(i, 'monthly'),
                        this.bankFArray.value[i].average.adjustment = this.getAverageAmountCalculate(i, 'adjustment'),
                        this.bankFArray.value[i].average.monthly_true_revenue = this.getAverageAmountCalculate(i, 'monthly_true_revenue'),
                        this.bankFArray.value[i].average.average_daily = this.getAverageAmountCalculate(i, 'average_daily'),
                        this.bankFArray.value[i].average.nsf = this.getAverageAmountCalculate(i, 'nsf'),
                        this.bankFArray.value[i].average.neg_days = this.getAverageAmountCalculate(i, 'neg_days'),
                        this.bankFArray.value[i].average.hash_of_deposit = this.getAverageAmountCalculate(i, 'hash_of_deposit'),
                        this.bankFArray.value[i].average.ending_balance = this.getAverageAmountCalculate(i, 'ending_balance')
                }
                this.commonService.showSpinner();
                let lenders = [];
                for (let i = 0; i < this.lenderForm.value.lender.length; i++) {
                    let lender = {
                        ...this.lenderForm.value.lender[i],
                        // funded_date: this.formatter.format(this.lenderForm.value.lender[i].funded_date),
                    }
                    lenders.push(lender);
                }
                let registerDate = new Date().toJSON("yyyy/MM/dd HH:mm");
                const bankFormData = this.bankForm.value;
                let data = {
                    ...this.bankForm.value,
                    ...this.lenderForm.value,
                    lead_id: this.leadId,
                    business_start_date: this.formatter.format(bankFormData.bussisness_date),
                    note: bankFormData.note.trim(),
                    lender: lenders,
                    state_id: bankFormData.state,
                    download: "download",
                    current_date_time: this.getDate(registerDate),
                    document_ids: this.fcsDetails?.document_ids
                }
                const res$ = this.apiService.postReq(API_PATH.SUBMIT_FCS, data, 'lead', 'view');
                const response = await lastValueFrom(res$);
                if (response && response.data) {
                    FileSaver.saveAs(response.data.path, "Fcsdetails");

                    this.commonService.hideSpinner();
                }
                this.commonService.hideSpinner();
            } else {
                this.commonService.showError('Please enter required fields first')
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

    // changeBankTitle(index: any){
    //     console.log("bjh", index);
    //     for (let i = 0; i < this.bankFArray.value.length; i++) {
    //         console.log("knj", this.bankFArray.value[i].bank_title);
    //         if(this.bankFArray.value[i].bank_title.toLowerCase() == this.bankFArray.value[index].bank_title.toLowerCase()){
    //                 console.log("if true");
    //                 this.commonService.showError("please select different bank")

    //         }


    //     }


    // }
    async onSubmit() {
        try {
            this.bankForm.markAllAsTouched();
            this.lenderForm.markAllAsTouched();
            if (this.bankForm.valid && this.lenderForm.valid) {
                for (let i = 0; i < this.lenderForm.value.lender.length; i++) {
                    if (this.lenderForm.value.lender[i].funded_date && !Custom_Regex.date.test(this.lenderForm.value.lender[i].funded_date)) {
                        this.commonService.showError('Invalid funded date.');
                        this.commonService.hideSpinner();
                        return;
                    }
                }
                this.commonService.showSpinner();


                for (let i = 0; i < this.bankFArray.value.length; i++) {
                    this.bankFArray.value[i].total.monthly = this.getTotalAmountCalculate(i, 'monthly'),
                        this.bankFArray.value[i].total.adjustment = this.getTotalAmountCalculate(i, 'adjustment'),
                        this.bankFArray.value[i].total.monthly_true_revenue = this.getTotalAmountCalculate(i, 'monthly_true_revenue'),
                        this.bankFArray.value[i].total.average_daily = this.getTotalAmountCalculate(i, 'average_daily'),
                        this.bankFArray.value[i].total.nsf = this.getTotalAmountCalculate(i, 'nsf'),
                        this.bankFArray.value[i].total.neg_days = this.getTotalAmountCalculate(i, 'neg_days'),
                        this.bankFArray.value[i].total.hash_of_deposit = this.getTotalAmountCalculate(i, 'hash_of_deposit'),
                        this.bankFArray.value[i].total.ending_balance = this.getTotalAmountCalculate(i, 'ending_balance'),
                        this.bankFArray.value[i].average.monthly = this.getAverageAmountCalculate(i, 'monthly'),
                        this.bankFArray.value[i].average.adjustment = this.getAverageAmountCalculate(i, 'adjustment'),
                        this.bankFArray.value[i].average.monthly_true_revenue = this.getAverageAmountCalculate(i, 'monthly_true_revenue'),
                        this.bankFArray.value[i].average.average_daily = this.getAverageAmountCalculate(i, 'average_daily'),
                        this.bankFArray.value[i].average.nsf = this.getAverageAmountCalculate(i, 'nsf'),
                        this.bankFArray.value[i].average.neg_days = this.getAverageAmountCalculate(i, 'neg_days'),
                        this.bankFArray.value[i].average.hash_of_deposit = this.getAverageAmountCalculate(i, 'hash_of_deposit'),
                        this.bankFArray.value[i].average.ending_balance = this.getAverageAmountCalculate(i, 'ending_balance')
                }

                let lenders = [];
                for (let i = 0; i < this.lenderForm.value.lender.length; i++) {
                    let lender = {
                        ...this.lenderForm.value.lender[i],
                        payment_status: this.lenderForm.value.lender[i].payment_status ? 1 : 0
                        // funded_date: this.lenderForm.value.lender[i].funded_date ? this.lenderForm.value.lender[i].funded_date : "",
                    }
                    lenders.push(lender);
                }
                let registerDate = new Date().toJSON("yyyy/MM/dd HH:mm");
                let data = {
                    ...this.bankForm.value,
                    ...this.lenderForm.value,
                    lead_id: this.leadId,
                    business_start_date: this.formatter.format(this.bankForm.value.bussisness_date),
                    note: this.bankForm.value.note.trim(),
                    lender: lenders,
                    state_id: this.bankForm.value.state,
                    current_date_time: this.getDate(registerDate),
                    download: "submit",
                    document_ids: this.fcsDetails?.document_ids
                }
                const res$ = this.apiService.postReq(API_PATH.SUBMIT_FCS, data, 'lead', 'view');
                const response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.leadFcsSubmit.emit();
                    // this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadId],
                    //     // { queryParams: { activeTab: 'Updates' } });
                    //     { queryParams: { activeTab: 'Documents' } });
                } else {
                    this.commonService.showError(response.message);
                }
                this.commonService.hideSpinner();
            } else {
                this.commonService.showError('Please enter required fields first')
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
    // custom datepicker color
    ngDoCheck(): void {
        this.getDateColor();
    }

    getDateColor() {
        let date = document.getElementsByClassName('btn-light bg-primary text-white');
        for (let i = 0; i < date.length; i++) {
            date[i].setAttribute('style', `background-color:${this.color}!important`)
        }
        // date.setAttribute('style',`color:${this.color} !important`)
        let monthNameClr = document.getElementsByClassName('ngb-dp-month-name');
        // let data3 = document.getElementsByClassName('btn btn-link ngb-dp-arrow-btn');
        let arrowColor = document.getElementsByClassName('ngb-dp-navigation-chevron') as HTMLCollectionOf<HTMLElement>;
        for (let i = 0; i < monthNameClr.length; i++) {
            monthNameClr[i].setAttribute('style', `color:${this.color}`)
            // arrowColor[i].setAttribute('style',`border-color:${this.color}`)
            //  arrowColor[i].style.setProperty('--custom',`${this.color}`);

        }
        let weekNameClr = document.getElementsByClassName('ngb-dp-weekday small');
        for (let i = 0; i < weekNameClr.length; i++) {
            weekNameClr[i].setAttribute('style', `color:${this.color}`)
        }
        for (let i = 0; i < arrowColor.length; i++) {
            arrowColor[i].style.setProperty('border-color', `${this.color}`);

        }
    }
    initFundDate() {
        for (let i = 0; i < this.lenderFArray.length; i++) {
            let data = document.getElementById(`${i}`);
            if (data) {
                Inputmask('datetime', {
                    inputFormat: 'mm-dd-yyyy',
                    placeholder: 'mm-dd-yyyy',
                    alias: 'datetime',
                    min: '01-01-1920',
                    max: this.currentDate,
                    clearMaskOnLostFocus: false,
                }).mask(data);
            }

        }


    }
    //reset FCS data
    resetFCSdata() {
        try {

            Swal.fire({
                title: 'Are you sure to reset the data ?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: this.color,
            }).then((result) => {
                if (result.value) {
                    this.commonService.showSpinner();
                    let pushFormOnPreviousLength = this.bankFArray.value.length
                    this.bankFArray.clear();
                    for (let index = 0; index < pushFormOnPreviousLength; index++) {
                        this.bankFArray.push(this.fcsForm())
                    }
                    this.commonService.hideSpinner();
                   
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    Swal.close()
                }
            })
            // this.commonService.showSpinner();
            // let pushFormOnPreviousLength = this.bankFArray.value.length
            // this.bankFArray.clear();
            // for (let index = 0; index < pushFormOnPreviousLength; index++) {
            //     this.bankFArray.push(this.fcsForm())
            // }
            // this.commonService.hideSpinner();

         
        } catch (e) {
            this.commonService.hideSpinner();
            console.log(e)
        }
    }

    ngAfterViewInit(): void {
        this.changeDetectorRef.detectChanges();
        setTimeout(() => {
            this.initFundDate();
        }, 0);
    }
    fetchFcsData() {
        this.leadFcsSubmit.emit();
        this.router.navigate([`/${this.userBaseRoute}/money-thumb-fcs/${this.leadId}`]);
    }
    getDailyPaymentValue(index: any) {
        if (this.lenderForm.value.lender[index].payment_status == 1) {
            let weeklyPayment = Number(this.lenderForm.value.lender[index].daily_payments) * 5;
            this.lenderFArray.controls[index].patchValue({ daily_payments: weeklyPayment });
            this.calculateWithholdPercentage(index,this.lenderForm.value.lender[index].payment_status) // weeks calculate 4.20 dynamic
        } else {
            let dailyPyment = Number(this.lenderForm.value.lender[index].daily_payments) / 5;
            this.lenderFArray.controls[index].patchValue({ daily_payments: dailyPyment });
            this.calculateWithholdPercentage(index,this.lenderForm.value.lender[index].payment_status)  // days 21 dynamic
        }
    }

}
