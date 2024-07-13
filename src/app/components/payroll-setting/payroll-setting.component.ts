import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { Subscription, lastValueFrom } from 'rxjs';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '@services/common.service';
import { API_PATH } from '@constants/api-end-points';
import { Router } from '@angular/router';
import { ApiService } from '@services/api.service';
import * as Constants from '@constants/constants';

@Component({
    selector: 'app-payroll-setting',
    templateUrl: './payroll-setting.component.html',
    styleUrls: ['./payroll-setting.component.scss']
})
export class PayrollSettingComponent implements OnInit {
    payrollForm!: FormGroup | any;
    colorSubs!: Subscription;
    color: string = '';
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: any = '';
    maxDate!: NgbDateStruct;
    minDate!: any;
    @ViewChild('datepicker') datepicker: any;
    @ViewChild('endDate') endDate: any;
    maxDatePayroll!: NgbDateStruct;
    payrollArray: Array<any> = [];

    constructor(private fb: FormBuilder,
        private authService: AuthService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
        private commonService: CommonService,
        private router: Router,
        private apiService: ApiService,
        private cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.getUserDetail();
        this.initPayrollSettingForm();
        this.getPayrollData();
        this.minDate = this.calendar.getToday();
        this.maxDate = this.calendar.getToday();

    }



    initPayrollSettingForm() {
        this.payrollForm = this.fb.group({
            add_multiple_payroll: this.fb.array([]),
        })
        // this.addMultiplePayrollForm();
    }
    get multiplePayrollFromArray() {
        return this.payrollForm.get('add_multiple_payroll') as FormArray;
    }
    addMultiplePayroll(data: any) {
        return this.fb.group({
            payroll_period_type: [data.payroll_period_type ? data.payroll_period_type : '', [Validators.required]],
            // date_range: [],
            paid_date: [data.paid_date ? data.paid_date : '', [Validators.required]],
            start_date: [data.start_date ? data.start_date : '', [Validators.required]],
            end_date: [data.end_date ? data.end_date : '', [Validators.required]],
            amount_paid: [data.amount_paid ? data.amount_paid : ''],
            selected_date: [data.end_date ? data.end_date : ''],
            // ,[Validators.required]]
            // payroll_cycle:[],
            // payroll_paid_date:[],
        })
    }
    addMultiplePayrollForm() {
        return this.multiplePayrollFromArray.push(this.addMultiplePayroll({}));
    }
    removeAtIndex(i: number) {
        this.multiplePayrollFromArray.removeAt(i);
    }
    get f(): { [key: string]: AbstractControl } {
        return this.payrollForm.controls;
    }
    getUserDetail(): void {
        let ud = this.authService.getUserDetails();
        if (ud) {
            // this.userRole = ud.role;
            // this.timeZone = ud.time_zone;
            // this.dateFormat = ud.date_format;
            //
            this.getColorOnUpdate();
            this.color = ud?.color;
        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetail();
        });
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
    onChangePeriod(i: any) {
        if (this.multiplePayrollFromArray.controls[i].get('payroll_period_type')?.value == 'monthly') {

            //    let date = this.minDate?.month + 1
            //     if( this.maxDate?.month < date){
            //      this.maxDate.month += 1 ;
            //       this.maxDate.day = this.minDate?.day
            //     console.log(this.maxDate,'monthly')
            //     }else if( date == 1 && date < this.maxDate?.month ){
            //         this.maxDate.month += 1 ;
            //       this.maxDate.day = this.minDate?.day;

            //     }
        }


        if (this.multiplePayrollFromArray.controls[i].get('payroll_period_type')?.value == 'bi-weekly') {

            // this.maxDate.day += 14;
            // this.maxDate.month = this.minDate.month
            // console.log(this.maxDate,'bi-weekly')

        }
    }
    changeStartDate(i: any) {

        let currentMonth = new Date();
        let date = new Date();
        // monthly All case
        if (this.multiplePayrollFromArray.controls[i].get('payroll_period_type')?.value == 'monthly') {
            let monthDate = this.multiplePayrollFromArray.controls[i].get('start_date')?.value;
            if (monthDate) {
                let date = new Date();
                date.setDate(monthDate?.day + 30);
                let finalDate = {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate()
                }

                this.multiplePayrollFromArray.controls[i].patchValue({ selected_date: finalDate })

                // this.maxDatePayroll = finalDate ;
                // constat every next month
                let paidDate = {
                    year: date.getFullYear(),
                    month: currentMonth.getMonth() + 2,
                    day: 10
                }
                this.multiplePayrollFromArray.controls[i].patchValue({ end_date: finalDate })
                this.multiplePayrollFromArray.controls[i].patchValue({ paid_date: paidDate })
            }
        }
        //bi-weekly All case
        if (this.multiplePayrollFromArray.controls[i].get('payroll_period_type')?.value == 'bi-weekly') {
            let monthDate = this.multiplePayrollFromArray.controls[i].get('start_date')?.value;
            if (monthDate) {
                // {year: 2023, month: 7, day: 1} response format
                if (monthDate?.day <= 15) {
                    // let date = new Date();
                    date.setDate(monthDate?.day + 14);
                    let endDateFirstHalf = {
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        day: date.getDate()
                    }
                    this.multiplePayrollFromArray.controls[i].patchValue({ selected_date: endDateFirstHalf })
                    this.multiplePayrollFromArray.controls[i].patchValue({ end_date: endDateFirstHalf })
                } else if (monthDate?.day >= 16) {
                    let getCurrentYear = date.getFullYear(), getCurrentMonth = date.getMonth();
                    // let firstDay = new Date(getCurrentYear, getCurrentMonth, 1);
                    let lastDay = new Date(getCurrentYear, getCurrentMonth + 1, 0);
                    // console.log(lastDay)
                    let getLastDateOfMonth = lastDay?.getDate();
                    // new Date(lastDay).getDate();
                    let endDateSecondHalf = {
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        // day: date.getDate()
                        day: getLastDateOfMonth
                    }
                    this.multiplePayrollFromArray.controls[i].patchValue({ selected_date: endDateSecondHalf })
                    this.multiplePayrollFromArray.controls[i].patchValue({ end_date: endDateSecondHalf })
                }

                let endDate = this.multiplePayrollFromArray.controls[i].get('end_date')?.value
                if (endDate?.day >= 1 && endDate?.day <= 15) {
                    let paidDate = {
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        day: 25
                    }

                    this.multiplePayrollFromArray.controls[i].patchValue({ paid_date: paidDate })

                } else {
                    // working when date is > than 16 month shifted to next month 
                    let paidDate = {
                        year: date.getFullYear(),
                        month: currentMonth.getMonth() + 2,
                        day: 10
                    }
                    this.multiplePayrollFromArray.controls[i].patchValue({ paid_date: paidDate })


                }
                //  this.multiplePayrollFromArray.controls[i].patchValue({paid_date:paidDate})
            }
        }
        //daily All case
        if (this.multiplePayrollFromArray.controls[i].get('payroll_period_type')?.value == 'daily') {
            let monthDate = this.multiplePayrollFromArray.controls[i].get('start_date')?.value;
            if (monthDate) {
                if (monthDate?.day <= 15) {
                    date.setDate(monthDate?.day + 14);
                    let firstHalfDailyDate = {
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        day: date.getDate()
                    }
                    this.multiplePayrollFromArray.controls[i].patchValue({ selected_date: firstHalfDailyDate })
                    this.multiplePayrollFromArray.controls[i].patchValue({ end_date: firstHalfDailyDate })
                } else if (monthDate?.day >= 16) {
                    let getCurrentYear = date.getFullYear(), getCurrentMonth = date.getMonth();
                    // let firstDay = new Date(getCurrentYear, getCurrentMonth, 1);
                    let lastDay = new Date(getCurrentYear, getCurrentMonth + 1, 0);
                    // console.log(lastDay.getDate(),'jfdf')
                    //    console.log(lastDay)
                    let getLastDateOfMonth = lastDay?.getDate();
                    //    new Date(lastDay).getDate();
                    let endDateSecondHalfDaily = {
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        // day: date.getDate()
                        day: getLastDateOfMonth
                    }
                    this.multiplePayrollFromArray.controls[i].patchValue({ selected_date: endDateSecondHalfDaily })
                    this.multiplePayrollFromArray.controls[i].patchValue({ end_date: endDateSecondHalfDaily })
                }

                let endDate = this.multiplePayrollFromArray.controls[i].get('end_date')?.value
                if (endDate?.day >= 1 && endDate?.day <= 15) {
                    let paidDate = {
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        day: 25
                    }
                    this.multiplePayrollFromArray.controls[i].patchValue({ paid_date: paidDate })

                } else {
                    // working when date is > than 16 month shifted to next month 
                    let paidDate = {
                        year: date.getFullYear(),
                        month: currentMonth.getMonth() + 2,
                        day: 10
                    }
                    this.multiplePayrollFromArray.controls[i].patchValue({ paid_date: paidDate })


                }

                //  this.multiplePayrollFromArray.controls[i].patchValue({paid_date:paidDate})
            }
        }
    }
    onDateSelection(date: NgbDate) {

        // console.log("hjbj", this.payrollForm.value.payroll_period_type);
        // if(this.payrollForm.value.payroll_period_type == ''){
        //     this.commonService.showErrorMessage("Please select payroll period first");
        //     this.datepicker.toggle();
        //     return
        // }
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
                // this.tempFilter['Date'].value = this.selectedDate;
                // this.onSearch();
            }
        }
    }


    async payrollSubmit() {
        for (let index = 0; index < this.payrollForm.value.add_multiple_payroll.length; index++) {
            if (this.payrollForm.value.add_multiple_payroll[index].payroll_period_type == 'daily') {
                for (let i = 0; i < this.payrollForm.value.add_multiple_payroll.length; i++) {
                    this.payrollForm.get('add_multiple_payroll')['controls'][index].controls.amount_paid.setValidators([Validators.required, Validators.pattern(Constants.Custom_Regex.amount)]);
                    this.payrollForm.get('add_multiple_payroll')['controls'][index].controls.amount_paid.updateValueAndValidity();
                    this.payrollForm.get('add_multiple_payroll')['controls'][index].controls.amount_paid.markAsTouched();
                }
            } else {
                this.payrollForm.get('add_multiple_payroll')['controls'][index].controls.amount_paid.clearValidators();
                this.payrollForm.get('add_multiple_payroll')['controls'][index].controls.amount_paid.updateValueAndValidity();
            }
        }
        this.payrollForm.markAllAsTouched();
        let data: any = {
            payroll_settings: [],
        }
        for (let i = 0; i < this.payrollForm.value.add_multiple_payroll.length; i++) {
            let ins = {
                payroll_period_type: this.payrollForm.value.add_multiple_payroll[i].payroll_period_type,
                start_date: this.formatter.format(this.payrollForm.value.add_multiple_payroll[i].start_date),
                end_date: this.formatter.format(this.payrollForm.value.add_multiple_payroll[i].end_date),
                paid_date: this.formatter.format(this.payrollForm.value.add_multiple_payroll[i].paid_date),
                amount_paid: this.payrollForm.value.add_multiple_payroll[i].amount_paid,
            }
            data.payroll_settings.push(ins);
        }
        if (this.payrollForm.valid) {
            let data: any = {
                payroll_settings: [],
            }
            for (let i = 0; i < this.payrollForm.value.add_multiple_payroll.length; i++) {
                let ins = {
                    payroll_period_type: this.payrollForm.value.add_multiple_payroll[i].payroll_period_type,
                    start_date: this.formatter.format(this.payrollForm.value.add_multiple_payroll[i].start_date),
                    end_date: this.formatter.format(this.payrollForm.value.add_multiple_payroll[i].end_date),
                    paid_date: this.formatter.format(this.payrollForm.value.add_multiple_payroll[i].paid_date),
                    amount_paid: this.payrollForm.value.add_multiple_payroll[i].amount_paid,
                }
                data.payroll_settings.push(ins);
            }
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.ADD_PAYROLL_SETTING, data, 'payroll', 'setting');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/payroll-list`]);
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
   
    async getPayrollData() {
        try {
            // let url = `?&lead_id=${this.leadID}`
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_PAYROLL_DATA, 'payroll', 'setting');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.payrollArray = response.data;
                let actual_data = {}
                for (let i = 0; i < response.data?.length; i++) {
                    actual_data = {
                        payroll_period_type: response.data[i].payroll_period_type,
                        start_date: this.formatter.parse(response.data[i].start_date),
                        end_date: this.formatter.parse(response.data[i].end_date),
                        paid_date: this.formatter.parse(response.data[i].paid_date),
                        amount_paid: response.data[i].amount_paid,
                    }
                    this.multiplePayrollFromArray.push(
                        this.addMultiplePayroll(actual_data)
                    );

                }
                // if (!this.multiplePayrollFromArray.length && !this.multiplePayrollFromArray.length) {
                //     this.addAgentForm(true);
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
    payrollPeriodType(i: any) {
        if (this.payrollForm.value.add_multiple_payroll[i].payroll_period_type == 'daily') {
            for (let i = 0; i < this.payrollForm.value.add_multiple_payroll.length; i++) {
                this.payrollForm.get('add_multiple_payroll')['controls'][i].controls.amount_paid.setValidators([Validators.required, Validators.pattern(Constants.Custom_Regex.amount)]);
                this.payrollForm.get('add_multiple_payroll')['controls'][i].controls.amount_paid.updateValueAndValidity();
                //   this.payrollForm.get('add_multiple_payroll')['controls'][i].controls.amount_paid.markAsTouched();
            }
        } else {
            this.payrollForm.get('add_multiple_payroll')['controls'][i].controls.amount_paid.clearValidators();
            this.payrollForm.get('add_multiple_payroll')['controls'][i].controls.amount_paid.updateValueAndValidity();
        }
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();

    }
    ngAfterContentChecked() {
        this.cdr.detectChanges();
    }

}
