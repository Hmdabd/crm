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
import moment from 'moment';


@Component({
    selector: 'app-payroll-settings-admin',
    templateUrl: './payroll-settings-admin.component.html',
    styleUrls: ['./payroll-settings-admin.component.scss']
})
export class PayrollSettingsAdminComponent implements OnInit {
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
    style!: { fill: string; };
    timeZone: string = ''
    dateFormat: string = '';
    hasMoreUsers: boolean = false;
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    userListPage: number = 1;
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
    ngDoCheck(): void {

        this.getPaginationList();
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
            id: [data.id ? data.id : ''],
            company_name: [data.company_name ? data.company_name : ''],
            created_at: [data.created_at ? data.created_at : ''],
            phone_number: [data.phone_number ? data.phone_number : ''],
            email: [data.email ? data.email : ''],
            amount: [data.amount ? data.amount : '', [Validators.required]],
            start_date: [data.start_date ? data.start_date : '', [Validators.required]],
            end_date: [data.end_date ? data.end_date : '', [Validators.required]],
            invoice_date: [data.invoice_date ? data.invoice_date : '', [Validators.required]],
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
            this.timeZone = ud.time_zone;
            this.dateFormat = ud.date_format;
            this.getColorOnUpdate();
            this.color = ud?.color;
            this.style = { fill: ud?.color };
        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetail();
        });
    }


    // isHovered(date: NgbDate) {
    //     return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
    // }

    // isInside(date: NgbDate) {
    //     return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
    // }

    // isRange(date: NgbDate) {
    //     return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
    // }

    // validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    //     const parsed = this.formatter.parse(input);
    //     return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
    // }
    // onChangePeriod(i: any) {
    //     if (this.multiplePayrollFromArray.controls[i].get('payroll_period_type')?.value == 'monthly') {

    //         //    let date = this.minDate?.month + 1
    //         //     if( this.maxDate?.month < date){
    //         //      this.maxDate.month += 1 ;
    //         //       this.maxDate.day = this.minDate?.day
    //         //     console.log(this.maxDate,'monthly')
    //         //     }else if( date == 1 && date < this.maxDate?.month ){
    //         //         this.maxDate.month += 1 ;
    //         //       this.maxDate.day = this.minDate?.day;

    //         //     }
    //     }


    //     if (this.multiplePayrollFromArray.controls[i].get('payroll_period_type')?.value == 'bi-weekly') {

    //         // this.maxDate.day += 14;
    //         // this.maxDate.month = this.minDate.month
    //         // console.log(this.maxDate,'bi-weekly')

    //     }
    // }
    // changeStartDate(i: any) {

    //     let currentMonth = new Date();
    //     let date = new Date();
    //     // monthly All case
    //     if (this.multiplePayrollFromArray.controls[i].get('payroll_period_type')?.value == 'monthly') {
    //         let monthDate = this.multiplePayrollFromArray.controls[i].get('start_date')?.value;
    //         if (monthDate) {
    //             let date = new Date();
    //             date.setDate(monthDate?.day + 30);
    //             let finalDate = {
    //                 year: date.getFullYear(),
    //                 month: date.getMonth() + 1,
    //                 day: date.getDate()
    //             }

    //             this.multiplePayrollFromArray.controls[i].patchValue({ selected_date: finalDate })

    //             // this.maxDatePayroll = finalDate ;
    //             // constat every next month
    //             let paidDate = {
    //                 year: date.getFullYear(),
    //                 month: currentMonth.getMonth() + 2,
    //                 day: 10
    //             }
    //             this.multiplePayrollFromArray.controls[i].patchValue({ end_date: finalDate })
    //             this.multiplePayrollFromArray.controls[i].patchValue({ paid_date: paidDate })
    //         }
    //     }
    //     //bi-weekly All case
    //     if (this.multiplePayrollFromArray.controls[i].get('payroll_period_type')?.value == 'bi-weekly') {
    //         let monthDate = this.multiplePayrollFromArray.controls[i].get('start_date')?.value;
    //         if (monthDate) {
    //             // {year: 2023, month: 7, day: 1} response format
    //             if (monthDate?.day <= 15) {
    //                 // let date = new Date();
    //                 date.setDate(monthDate?.day + 14);
    //                 let endDateFirstHalf = {
    //                     year: date.getFullYear(),
    //                     month: date.getMonth() + 1,
    //                     day: date.getDate()
    //                 }
    //                 this.multiplePayrollFromArray.controls[i].patchValue({ selected_date: endDateFirstHalf })
    //                 this.multiplePayrollFromArray.controls[i].patchValue({ end_date: endDateFirstHalf })
    //             } else if (monthDate?.day >= 16) {
    //                 let getCurrentYear = date.getFullYear(), getCurrentMonth = date.getMonth();
    //                 // let firstDay = new Date(getCurrentYear, getCurrentMonth, 1);
    //                 let lastDay = new Date(getCurrentYear, getCurrentMonth + 1, 0);
    //                 // console.log(lastDay)
    //                 let getLastDateOfMonth = lastDay?.getDate();
    //                 // new Date(lastDay).getDate();
    //                 let endDateSecondHalf = {
    //                     year: date.getFullYear(),
    //                     month: date.getMonth() + 1,
    //                     // day: date.getDate()
    //                     day: getLastDateOfMonth
    //                 }
    //                 this.multiplePayrollFromArray.controls[i].patchValue({ selected_date: endDateSecondHalf })
    //                 this.multiplePayrollFromArray.controls[i].patchValue({ end_date: endDateSecondHalf })
    //             }

    //             let endDate = this.multiplePayrollFromArray.controls[i].get('end_date')?.value
    //             if (endDate?.day >= 1 && endDate?.day <= 15) {
    //                 let paidDate = {
    //                     year: date.getFullYear(),
    //                     month: date.getMonth() + 1,
    //                     day: 25
    //                 }

    //                 this.multiplePayrollFromArray.controls[i].patchValue({ paid_date: paidDate })

    //             } else {
    //                 // working when date is > than 16 month shifted to next month 
    //                 let paidDate = {
    //                     year: date.getFullYear(),
    //                     month: currentMonth.getMonth() + 2,
    //                     day: 10
    //                 }
    //                 this.multiplePayrollFromArray.controls[i].patchValue({ paid_date: paidDate })


    //             }
    //             //  this.multiplePayrollFromArray.controls[i].patchValue({paid_date:paidDate})
    //         }
    //     }
    //     //daily All case
    //     if (this.multiplePayrollFromArray.controls[i].get('payroll_period_type')?.value == 'daily') {
    //         let monthDate = this.multiplePayrollFromArray.controls[i].get('start_date')?.value;
    //         if (monthDate) {
    //             if (monthDate?.day <= 15) {
    //                 date.setDate(monthDate?.day + 14);
    //                 let firstHalfDailyDate = {
    //                     year: date.getFullYear(),
    //                     month: date.getMonth() + 1,
    //                     day: date.getDate()
    //                 }
    //                 this.multiplePayrollFromArray.controls[i].patchValue({ selected_date: firstHalfDailyDate })
    //                 this.multiplePayrollFromArray.controls[i].patchValue({ end_date: firstHalfDailyDate })
    //             } else if (monthDate?.day >= 16) {
    //                 let getCurrentYear = date.getFullYear(), getCurrentMonth = date.getMonth();
    //                 // let firstDay = new Date(getCurrentYear, getCurrentMonth, 1);
    //                 let lastDay = new Date(getCurrentYear, getCurrentMonth + 1, 0);
    //                 // console.log(lastDay.getDate(),'jfdf')
    //                 //    console.log(lastDay)
    //                 let getLastDateOfMonth = lastDay?.getDate();
    //                 //    new Date(lastDay).getDate();
    //                 let endDateSecondHalfDaily = {
    //                     year: date.getFullYear(),
    //                     month: date.getMonth() + 1,
    //                     // day: date.getDate()
    //                     day: getLastDateOfMonth
    //                 }
    //                 this.multiplePayrollFromArray.controls[i].patchValue({ selected_date: endDateSecondHalfDaily })
    //                 this.multiplePayrollFromArray.controls[i].patchValue({ end_date: endDateSecondHalfDaily })
    //             }

    //             let endDate = this.multiplePayrollFromArray.controls[i].get('end_date')?.value
    //             if (endDate?.day >= 1 && endDate?.day <= 15) {
    //                 let paidDate = {
    //                     year: date.getFullYear(),
    //                     month: date.getMonth() + 1,
    //                     day: 25
    //                 }
    //                 this.multiplePayrollFromArray.controls[i].patchValue({ paid_date: paidDate })

    //             } else {
    //                 // working when date is > than 16 month shifted to next month 
    //                 let paidDate = {
    //                     year: date.getFullYear(),
    //                     month: currentMonth.getMonth() + 2,
    //                     day: 10
    //                 }
    //                 this.multiplePayrollFromArray.controls[i].patchValue({ paid_date: paidDate })


    //             }

    //             //  this.multiplePayrollFromArray.controls[i].patchValue({paid_date:paidDate})
    //         }
    //     }
    // }
    // onDateSelection(date: NgbDate) {

    //     // console.log("hjbj", this.payrollForm.value.payroll_period_type);
    //     // if(this.payrollForm.value.payroll_period_type == ''){
    //     //     this.commonService.showErrorMessage("Please select payroll period first");
    //     //     this.datepicker.toggle();
    //     //     return
    //     // }
    //     if (!this.fromDate && !this.toDate) {
    //         this.fromDate = date;
    //     } else if (this.fromDate && !this.toDate && date && (date.equals(this.fromDate) || date.after(this.fromDate))) {
    //         this.toDate = date;
    //         this.datepicker.toggle();
    //     } else {
    //         this.toDate = null;
    //         this.fromDate = date;
    //     }
    //     let sDate = '';
    //     if (this.fromDate) {
    //         sDate = this.formatter.format(this.fromDate);
    //         if (this.toDate) {
    //             sDate = sDate + ' / ' + this.formatter.format(this.toDate);
    //             this.selectedDate = sDate;
    //             // this.tempFilter['Date'].value = this.selectedDate;
    //             // this.onSearch();
    //         }
    //     }
    // }


    async payrollSubmit() {
        this.payrollForm.markAllAsTouched();
        // let data: any = {
        //     payroll_settings: [],
        // }
        // for (let i = 0; i < this.payrollForm.value.add_multiple_payroll.length; i++) {
        //     let ins = {
        //         payroll_period_type: this.payrollForm.value.add_multiple_payroll[i].payroll_period_type,
        //         start_date: this.formatter.format(this.payrollForm.value.add_multiple_payroll[i].start_date),
        //         end_date: this.formatter.format(this.payrollForm.value.add_multiple_payroll[i].end_date),
        //         paid_date: this.formatter.format(this.payrollForm.value.add_multiple_payroll[i].paid_date),
        //         amount_paid: this.payrollForm.value.add_multiple_payroll[i].amount_paid,
        //     }
        //     data.payroll_settings.push(ins);
        // }
        if (this.payrollForm.valid) {
            let data: any = {
                payroll_settings: [],
            }
            for (let i = 0; i < this.payrollForm.value.add_multiple_payroll.length; i++) {
                let ins = {
                    id: this.payrollForm.value.add_multiple_payroll[i].id,
                    amount: this.payrollForm.value.add_multiple_payroll[i].amount,
                    start_date: this.formatter.format(this.payrollForm.value.add_multiple_payroll[i].start_date),
                    end_date: this.formatter.format(this.payrollForm.value.add_multiple_payroll[i].end_date),
                    invoice_date: this.formatter.format(this.payrollForm.value.add_multiple_payroll[i].invoice_date),
                }
                data.payroll_settings.push(ins);
            }
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.UPDATE_PAYROLL_SETTINGS_ADMIN, data, 'payroll', 'setting');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/admin/payroll-list`]);
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
    // async getDisclosureList(): Promise<any> {
    //     try {
    //         let url = `?&page_limit=${this.usersListLimit}&page=${this.userListPage}`;
          
    //         this.commonService.showSpinner();
    //         // 'agent', 'list'
    //         const res$ = this.apiService.getReq(API_PATH.GET_DISCLOSURE_LIST + url, 'disclosure', 'state-list');
    //         let response = await lastValueFrom(res$);
    //         if (response && response.data) {
    //             this.hasMoreUsers = response.data.hasMorePages;
    //             this.totalUsersCount = response.data.total;
    //             this.diclosureList = response.data.data;
    //         } else {
    //             this.diclosureList = [];
    //             this.hasMoreUsers = false;
    //             this.userListPage = 1;
    //         }
    //         this.commonService.hideSpinner();
    //     } catch (error: any) {
    //         this.commonService.hideSpinner();
    //         if (error.error && error.error.message) {
    //             this.commonService.showError(error.error.message);
    //         } else {
    //             this.commonService.showError(error.message);
    //         }
    //     }
    // }
    onPageChange(p: number): void {
        this.userListPage = p;
        // console.log("userListPage", this.userListPage)
        this.getPayrollData();
        // this.getLeadDocuments();
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();

    }
    ngAfterContentChecked() {
        this.cdr.detectChanges();
    }
    async getPayrollData() {
        try {
            let url = `?&page_limit=${this.usersListLimit}&page=${this.userListPage}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_PAYROLL_SETTING_ADMIN + url, 'payroll', 'setting');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                    this.hasMoreUsers = response.data.hasMorePages;
                    this.totalUsersCount = response.data.total;
                    this.payrollArray = [];
                    this.payrollArray = response.data.data;
                    this.multiplePayrollFromArray.controls = [];
                    let actual_data = {};
                    for (let i = 0; i < this.payrollArray?.length; i++) {
                        actual_data = {
                            id: this.payrollArray[i].id,
                            company_name: this.payrollArray[i].company_name,
                            created_at: this.payrollArray[i].created_at,
                            phone_number: this.payrollArray[i].phone_number,
                            email: this.payrollArray[i].email,
                            amount: this.payrollArray[i].amount,
                            start_date: this.formatter.parse(this.payrollArray[i].start_date),
                            end_date: this.formatter.parse(this.payrollArray[i].end_date),
                            invoice_date: this.formatter.parse(this.payrollArray[i].invoice_date),
                        }
                        this.multiplePayrollFromArray.push(
                            this.addMultiplePayroll(actual_data)
                        );
    
                    }
                } else {
                    // this.payrollForm.reset();
                    this.multiplePayrollFromArray.controls = [];
                    this.payrollArray = [];
                    this.hasMoreUsers = false;
                    this.userListPage = 1;
                }
                // if (!this.multiplePayrollFromArray.length && !this.multiplePayrollFromArray.length) {
                //     this.addAgentForm(true);
                // }
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
    async deletePayroll(id: any): Promise<void> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DELETE_LEADS, { delete_id: id }, 'lead', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                // this.leadsList = this.leadsList.filter(el => !ids.includes(el.id));
                // this.totalRecords = this.totalRecords - 1;
                // this.leadIdArray = [];
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
    getPaginationList() {

        let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
        for (let i = 0; i < data?.length; i++) {
            if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                data[i].style.background = this.color;
            } else {
                data[i].style.background = 'none';
    
            }
        }
    
    }
}

