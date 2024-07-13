import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { Roles } from '@constants/constants';
import Swal from 'sweetalert2';
import { ExcelService } from '@services/excel.service';
@Component({
    selector: 'app-payroll-list',
    templateUrl: './payroll-list.component.html',
    styleUrls: [
        '../../styles/dashboard.scss',
        '../../styles/predictive-search.scss',
        './payroll-list.component.scss',
    ],
})
export class PayrollListComponent implements OnInit {
    pageLimit: number = 10;
    fundedReportList: Array<any> = [];
    totalRecords: number = 0;
    page: number = 1;
    userListPage: number = 1;
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | any;
    toDate!: NgbDate | any;
    selectedDate: any = '';
    maxDate!: NgbDateStruct;
    lendersList: Array<any> = [];
    userList: Array<any> = [];
    hasMoreUsers: boolean = false;
    payrollOptions = [
        { id: 0, name: 'New Payroll' },
        { id: 1, name: 'Existing Payroll' },
    ];
    companyPaidStatusOptions = [
        { id: 0, name: 'paid' },
        { id: 1, name: 'unpaid' },
    ];
    agentPaidStatusOptions = [
        { id: 0, name: 'paid' },
        { id: 1, name: 'unpaid' },
        // { id: 2, name: 'Lender Commission Paid' },
        // { id: 3, name: 'Upfront Commission Paid' },
    ];
    feePaidStatusOptions = [
        { id: 0, name: 'paid' },
        { id: 1, name: 'unpaid' },
        // { id: 2, name: 'Lender Commission Paid' },
        // { id: 3, name: 'Upfront Commission Paid' },
    ];
    confirmedOptions = [
        { id: 0, name: 'Yes' },
        { id: 1, name: 'No' },
    ];
    defaultOptions = [
        { id: 0, name: 'Yes' },
        { id: 1, name: 'No' },
    ];
    @ViewChild('datepicker') datepicker: any;
    @ViewChild('selectAll') selectAll!: ElementRef;
    selectionDate =
        { year: 0, name: 'Yes' }


    tempFilter: { [key: string]: any } = {
        "Date": { value: '' },
        "Business name": { value: '' },
        "Funding amount": { value: '' },
        "Payback amount": { value: '' },
        "Lender": { value: null },
        "Payroll": { value: null },
        "Select Payroll": { value: null },
        "User": { value: null },
        "Commission Paid Status": { value: null },
        "Paid Status": { value: null },
        "Is Confirmed": { value: null },
        "Is Default": { value: null },
        "Fee Paid Status": { value: null },

    };
    appliedFilter: { [key: string]: any } = {
    }
    companyStatus: string = '';
    searchKeyword: string = '';
    usersList: Array<any> = [];
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    dateFormat: string = '';
    timeZone: string = '';
    canViewPayroll: boolean = false;
    predictiveSearchResults: Array<any> = [];
    @ViewChild('predictiveSearch', { static: false })
    predictiveSearch!: ElementRef;
    colorSubs!: Subscription;
    style!: { fill: string; };
    background!: { background: string; };
    color!: string;
    dashboardData: any = {};
    userRole: string = '';
    roles = Roles;
    canListLead: boolean = false;
    search = {
        order: 'DESC',
        sortby: 'created_at'
    }
    boo: boolean = false;
    payrollIdArray: Array<any> = [];
    canExportPayroll: boolean = false;
    userDetails: any = {};
    totalCommission: any = 0;
    updatedBrokerCommission: any = 0;
    companyType: string = '';
    payrollSearchListing: Array<any> = [];
    // minDateRange: any ={ year: 1900, month: 1, day: 1 }
    userListingPage: number = 1;
    usersListing: Array<any> = [];
    showPayroll: boolean = false;
    dateChangeStatus: boolean = false;


    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
        private route: ActivatedRoute,
        private authService: AuthService,
        private excelService: ExcelService,

    ) { }

    ngOnInit(): void {
        this.getUserDetails();
        this.getlendersList()
        this.canViewPayroll = this.authService.hasPermission('payroll-view');
        this.canExportPayroll = this.authService.hasPermission('payroll-export');
        this.maxDate = this.calendar.getToday();
        this.getUsersList();
        this.getuserListing();
    }

    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userDetails = ud;
                this.companyType = ud?.company_type;
                this.userRole = ud.role
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
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
    
    ngDoCheck(): void {

        this.getPaginationList();
        this.getDateColor();
    }
    // custom datepicker color
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
    }
    async getlendersList() {
        try {
            const res$ = this.apiService.getReq(
                API_PATH.PAYROLL_LIST_LENDER,
                '',
                ''
            );
            let response = await lastValueFrom(res$);
            this.commonService.showSpinner();

            if (response && response.status_code == '200') {
                this.lendersList = response.data.lender_list;
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
   
    getDate(date: any) {
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
    /**
     * @description get users list eg company list if adminisrator is logged in
     */
    async getUsersList(): Promise<any> {
        try {
            this.commonService.showSpinner();
            let payrollType = ''
            if (this.tempFilter['Payroll']?.value && this.tempFilter['Payroll'].value.name) {
                payrollType = this.tempFilter['Payroll'].value.name
            }
            let url = `?sort_by=${this.search.sortby}&dir=${this.search.order}&page_limit=${this.usersListLimit}&page=${this.userListPage}&type=${payrollType}`;
            if (this.appliedFilter['Date']?.value) {
                url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
            }
            if (this.appliedFilter['Business name']?.value) {
                url = `${url}&business_name=${this.appliedFilter['Business name']?.value}`;
            }
            // if (this.appliedFilter['Funding amount']?.value) {
            //     url = `${url}&funding_amount=${this.appliedFilter['Funding amount']?.value}`;
            // }
            // if (this.appliedFilter['Payback amount']?.value) {
            //     url = `${url}&payback_amount=${this.appliedFilter['Payback amount']?.value}`;
            // }
            if (this.appliedFilter['Lender']?.value && this.appliedFilter['Lender'].value.id) {
                url = `${url}&lender_id=${this.appliedFilter['Lender'].value.id}`;
            }
            // if (this.appliedFilter['Payroll']?.value && this.appliedFilter['Payroll'].value.name) {
            //     url = `${url}&new_payroll=${this.appliedFilter['Payroll'].value.name}`;
            // }
            if (this.appliedFilter['Payroll']?.value && this.appliedFilter['Payroll'].value.name == 'Existing Payroll') {
                if (this.appliedFilter['Select Payroll']?.value && this.appliedFilter['Select Payroll'].value.name) {
                    url = `${url}&payroll=${this.appliedFilter['Select Payroll']?.value.name}`;
                }
            }
            if (this.appliedFilter['User']?.value && this.appliedFilter['User'].value.id) {
                url = `${url}&agent_user=${this.appliedFilter['User'].value.id}`;
            }
            if (this.appliedFilter['Commission Paid Status']?.value && this.appliedFilter['Commission Paid Status'].value.name) {
                url = `${url}&company_paid_status=${this.appliedFilter['Commission Paid Status'].value.name}`;
            }
            if (this.appliedFilter['Paid Status']?.value && this.appliedFilter['Paid Status'].value.name) {
                url = `${url}&agent_paid_status=${this.appliedFilter['Paid Status'].value.name}`;
            }
            if (this.appliedFilter['Fee Paid Status']?.value && this.appliedFilter['Fee Paid Status'].value.name) {
                url = `${url}&fee_paid_status=${this.appliedFilter['Fee Paid Status'].value.name}`;
            }
            // if (this.appliedFilter['Is Confirmed']?.value && this.appliedFilter['Is Confirmed'].value.name) {
            //     url = `${url}&is_confirmed=${this.appliedFilter['Is Confirmed'].value.name}`;
            // }
            // if (this.appliedFilter['Is Default']?.value && this.appliedFilter['Is Default'].value.name) {
            //     url = `${url}&is_default=${this.appliedFilter['Is Default'].value.name}`;
            // }
            const res$ = this.apiService.getReq(
                API_PATH.PAYROLL_LIST + url,
                'payroll',
                'list'
            );
            let response = await lastValueFrom(res$);
            // && response.data.data)
            if (response && response.data && response.data.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                this.totalUsersCount = response.data.total;
                this.usersList = response.data.data;
                //  console.log('payroll-list',this.usersList);
                
            } else {
                this.usersList = [];
                this.hasMoreUsers = false;
                this.userListPage = 1;
                this.totalUsersCount = 0;
            }
            if (response && response.data.payroll_search) {
                this.payrollSearchListing = response.data.payroll_search;

                if (this.payrollSearchListing.length) {
                    // console.log("kjbhk", this.tempFilter['Payroll'].value.name);
                    // this.tempFilter['Select Payroll'].value = this.payrollSearchListing[0];
                    // && this.tempFilter['Select Payroll'].value && this.tempFilter['Select Payroll'].value.name
                    if (this.tempFilter['Payroll']?.value && this.tempFilter['Payroll'].value.name == 'New Payroll') {
                        // let date = this.tempFilter['Select Payroll'].value.name.split('/');
                        let date = this.payrollSearchListing[0].name.split('/');
                        let selectedfromDate = date[0];
                        let actualdate = date[0].split('-');
                        if (actualdate) {
                            let actualminDate = {
                                year: Number(actualdate[2]),
                                month: Number(actualdate[0]),
                                day: Number(actualdate[1])
                            }
                            this.fromDate = actualminDate
                        }
                        let newDate = new Date();
                        let day: any = newDate.getDate();
                        if (day.toString().length < 2) {
                            day = '0' + day;
                        }
                        let month: string | number = (newDate.getMonth() + 1);
                        if (month.toString().length < 2) {
                            month = '0' + month;
                        }
                        if (newDate) {
                            let actualtoDate = {
                                year: Number(newDate.getFullYear()),
                                month: Number(month),
                                day: Number(day)
                            }
                            this.toDate = actualtoDate
                        }
                        let selectedtoDate = `${month}-${day}-${newDate.getFullYear()}`;
                        if (!this.dateChangeStatus) {
                            this.selectedDate = selectedfromDate + ' / ' + selectedtoDate;
                            this.tempFilter['Date'].value = this.selectedDate;
                        }
                    } else {
                        this.selectedDate = '',
                            this.fromDate = null,
                            this.toDate = null;
                        this.tempFilter['Date'].value = null;
                    }
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
    resetFilter() {
        this.selectedDate = '';
        this.fromDate = null;
        this.toDate = null;
        for (const p in this.tempFilter) {
            this.tempFilter[p].value = null;
        }
        this.onSearch();
    }
    removeFilter(key: string) {
        if (key === 'Date') {
            this.selectedDate = '';
            this.toDate = null;
            this.fromDate = null;
        }
        this.tempFilter[key].value = null;
        this.onSearch();
    }

    /**
     * @description on Search click
     */
    onSearch() {
        this.userListPage = 1;
        this.appliedFilter = JSON.parse(JSON.stringify(this.tempFilter));
        this.getUsersList();
    }

    /**
     * @description on limit change
     * @param value
     * @returns {void}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    onUsersLimitChange(value: number): void {
        this.usersListLimit = value;
        this.userListPage = 1;
        this.getUsersList();
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p
     */
    onUserPageChange(p: number): void {
        this.userListPage = p;
        this.getUsersList();
    }

    /**
     * @description delete user after confirmation
     * @param user
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async deleteUser(user: any): Promise<void> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(
                API_PATH.DELETE_USER,
                { user_id: user.id },
                'user',
                'delete'
            );
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.usersList = this.usersList.filter((e) => e.id != user.id);
                this.totalUsersCount = this.totalUsersCount - 1;
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

    isHovered(date: NgbDate) {
        return (
            this.fromDate &&
            !this.toDate &&
            this.hoveredDate &&
            date.after(this.fromDate) &&
            date.before(this.hoveredDate)
        );
    }

    isInside(date: NgbDate) {
        return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
    }

    isRange(date: NgbDate) {
        return (
            date.equals(this.fromDate) ||
            (this.toDate && date.equals(this.toDate)) ||
            this.isInside(date) ||
            this.isHovered(date)
        );
    }

    validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
        const parsed = this.formatter.parse(input);
        return parsed && this.calendar.isValid(NgbDate.from(parsed))
            ? NgbDate.from(parsed)
            : currentValue;
    }

    onDateSelection(date: NgbDate) {
        this.dateChangeStatus = true;
        if (!this.fromDate && !this.toDate) {
            this.fromDate = date;
        } else if (
            this.fromDate &&
            !this.toDate &&
            date &&
            (date.equals(this.fromDate) || date.after(this.fromDate))
        ) {
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
                this.userListPage = 1;

            }
        }
    }



    /**
     * @description reset company filters
     */
    resetCompanyList() {
        this.searchKeyword = '';
        this.selectedDate = '';
        this.fromDate = null;
        this.toDate = null;
        this.companyStatus = '';
        this.getUsersList();
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
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
    opencompanyPaidpopup(id: any, status: any, statusType: any) {
        Swal.fire({
            title: 'Are you sure?',
            // Mark company status as Paid
            text: 'Want to update the ' + statusType.toLowerCase() + ' status?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: this.color,
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                this.companyPaidStatus(id, status, statusType);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close();
            }
        })

    }
    /**
    * @description on status change
    * @param status
    * @returns
    */
    onStatusChange(status: string) {
        if (status === this.companyStatus) {
            return;
        }
        this.companyStatus = status;
        this.getUsersList();
    }
    async companyPaidStatus(id: any, status: any, statusType: any): Promise<void> {
        if (status == 'paid') {
            status = 'unpaid'
        } else if (status == 'unpaid') {
            status = 'paid'
        }
        let url = `?id=${id}&paid_status=${status}&status_type=${statusType}`;
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.UPDATE_COMPANY_STATUS + url, 'lead', 'pre-funding');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                this.getUsersList();
                //
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
            // }
        }

    }
    // getamount(lender_commission: any, upfront_commission: any) {
    //     let value = 0;
    //     if (upfront_commission) {
    //         value = Number(upfront_commission) * (Number(lender_commission) / 100);
    //         return '$' + value.toFixed(2)
    //     } else {
    //         return '';
    //     }
    getamountExport(lender_commission: any, upfront_commission: any) {
        let value = 0;
        if (upfront_commission) {
            value = Number(upfront_commission) * (Number(lender_commission) / 100);
            return '$' + value.toFixed(2)
        } else {
            return '';
        }
    }


    //new method for payroll-listing
    // getamount(lender_commission: any, upfront_commission: any, placeholder: any) {
    //     let value = 0;
    //     if (placeholder.agent_type == 'Assigned ISO') {
    //         return (placeholder.funding_amount / 100) * placeholder.lender_commission
    //     } else if (placeholder.agent_type != 'Assigned ISO') {
    //         value = Number(placeholder.upfront_broker_commission) * (Number(lender_commission) / 100);
    //         return '$' + value.toFixed(2)
    //     } else {
    //         return '';
    //     }
    // }

    //updated on 27th july 2023
    getamount(data: any, upfront_commission: any, placeholder: any,user:any) { 
        let value = 0;
        if (placeholder.agent_type == 'Assigned ISO') {
            let isoAmount = Number((placeholder.funding_amount / 100) * placeholder.lender_commission)
            return isoAmount.toFixed(2);
        } else if (placeholder.agent_type != 'Assigned ISO') {
            if(user.agent_commision === 'percentage'){
                let brokerCalculatedValue = Number(data?.funding_amount) * (Number(data?.total_points - data?.retail_points) / 100);
                let brokerCommission = Number(data?.upfront_broker_commission) - brokerCalculatedValue;
                let total_lenderCommisison = brokerCommission * Number(data?.lender_commission) / 100;
                let total_upfront_fee = Number(data?.upfront_fee) * Number(data?.upfront_commission) / 100;
                return (total_lenderCommisison + total_upfront_fee)
            }else{
                let total_lenderCommisison = Number(data?.lender_commission) 
                let total_upfront_fee =  Number(data?.upfront_commission) 
                return (total_lenderCommisison + total_upfront_fee)
            }
        } else {
            return '';
        }
    }

    // getAgentPaidDate(date: any){
    //     console.log("bh", date);

    //     let v1 = date.split('-');
    //     console.log("vhg", v1);

    //     let v2 = v1[2].split(" ");
    //     if(v2[0] <= 15){
    //         let v3 = + v1[0] + '-' + v1[1] + '-' + '25';
    //         console.log("bjhbh", v3);
    //         // return "25TH"

    //      return moment(v3).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
    //     }else  if(v2[0] >= 16){
    //         return "10TH"
    //     } else{
    //         return " "
    //     }

    // }

    getAgentPaidDate(paiddate: any, fundDate: any) {
        // console.log(paiddate,'sjhdsjhdgsd');
        
        let v1 = moment(paiddate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
  
        
        let fundDate1 = moment(fundDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
        //  console.log('funding Date',fundDate1);
        
        const array = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        if (this.dateFormat == 'MMM DD, YYYY' || this.dateFormat == 'MMM DD, yyyy') {
            let v2 = v1.split(" ");
            let v3 = v2[1].split(',');
            let fundDate2 = fundDate1.split(" ");
            let fundDate3 = fundDate2[1].split(',');
            // let fundingDate  = new Date(fundDate);  
            // let todayDate = new Date(paiddate);
            if ((v2[0] == fundDate2[0]) && (v2[2] == fundDate2[2])) {
                if ((Number(v3[0]) >= 1 && Number(v3[0]) <= 24) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 15)) {
                    let date25 = v2[0] + ' ' + '25,' + ' ' + v2[2];
                    
                    // + ' ' + v2[3] + ' ' + v2[4];
                    return date25
                } else if ((array.includes(Number(v3[0])) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31))) {
                    let date25 = this.getNextMonthName(v2[0]) + ' ' + '10,' + ' ' + this.getNextYear(v2[0], v2[2])
                    //  + ' ' + v2[3] + ' ' + v2[4];
                    
                    return date25
                } else {
                    let date25 = this.getNextMonthName(v2[0]) + ' ' + '10,' + ' ' + this.getNextYear(v2[0], v2[2])
                    //  + ' ' + v2[3] + ' ' + v2[4];
                   

                    return date25
                }


            } else {

                // if ((Number(v3[0]) >= 1 && Number(v3[0]) <= 9) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 31)) {
                //     let date10 = v2[0] + ' ' + '10,' + ' ' + v2[2]
                //     // + ' ' + v2[3] + ' ' + v2[4];
                //     return date10

                // } else if ((Number(v3[0]) >= 10 && Number(v3[0]) <= 24) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 31)) {
                //     let date25 = v2[0] + ' ' + '25,' + ' ' + v2[2]
                //     return date25
                // }
                // else if ((Number(v3[0]) >= 25 && Number(v3[0]) <= 31) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 31)) {
                //     // else if ((array.includes(Number(v3[0])) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31))) {
                //     let date25 = this.getNextMonthName(v2[0]) + ' ' + '10,' + ' ' + this.getNextYear(v2[0], v2[2])
                //     return date25
                // } else {
                //     let date25 = this.getNextMonthName(v2[0]) + ' ' + '10,' + ' ' + this.getNextYear(v2[0], v2[2])
                //     return date25
                // }
//UPDATES 5TH FEB

                if ((Number(v3[0]) >= 1 && Number(v3[0]) <= 24) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 15)) {
                    let date10 = v2[0] + ' ' + '25,' + ' ' + v2[2]
                    // + ' ' + v2[3] + ' ' + v2[4];
                    return date10

                } else if ((Number(v3[0]) >= 1 && Number(v3[0]) <= 9) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31)) {
                    let date25 = v2[0] + ' ' + '10,' + ' ' + v2[2]
                    return date25
                }
                else if ((Number(v3[0]) >= 16 && Number(v3[0]) <= 31) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31)) {
                    // else if ((array.includes(Number(v3[0])) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31))) {
                    let date25 = this.getNextMonthName(v2[0]) + ' ' + '10,' + ' ' + this.getNextYear(v2[0], v2[2])
                    return date25
                } else {
                    let date25 = this.getNextMonthName(v2[0]) + ' ' + '10,' + ' ' + this.getNextYear(v2[0], v2[2])
                    return date25
                }

            }

        } if (this.dateFormat == 'DD/MM/YYYY' || this.dateFormat == 'DD/MM/YYYY') {
            
            let v2 = v1.split("/");
            let v3 = v2[2].split(" ");
            let fundDate2 = fundDate1.split("/");
            let fundDate3 = fundDate2[2].split(" ");
            if ((v2[1] == fundDate2[1]) && (v3[0] == fundDate3[0])) {
                if ((Number(v2[0]) >= 1 && Number(v2[0]) <= 24) && (Number(fundDate2[0]) >= 1 && Number(fundDate2[0]) <= 15)) {
                 
                    
                    let date25 = '25' + '/' + v2[1] + '/' + v3[0];
                    return date25
                }
                 else if ((array.includes(Number(v2[0])) && (Number(fundDate2[0]) >= 16 && Number(fundDate2[0]) <= 31))) {
                    let date25 = '10' + '/' + this.getNextMonthNumber(v2[1]) + '/' + this.getNextYear(v2[1], v3[0]);
              

                    return date25
                } 
                else {
                    let date25 = '10' + '/' + this.getNextMonthNumber(v2[1]) + '/' + this.getNextYear(v2[1], v3[0]);
                    
                   

                    return date25
                }
            } else {
                // if ((Number(v2[0]) >= 1 && Number(v2[0]) <= 9) && (Number(fundDate2[0]) >= 1 && Number(fundDate2[0]) <= 31)) {
                //     let date10 = '10' + '/' + v2[1] + '/' + v3[0];
                //     // + ' ' + v2[3] + ' ' + v2[4];
                //     return date10

                // } else if ((Number(v2[0]) >= 10 && Number(v2[0]) <= 24) && (Number(fundDate2[0]) >= 1 && Number(fundDate2[0]) <= 31)) {
                //     let date25 = '25' + '/' + v2[1] + '/' + v3[0];
                //     return date25
                // }
                // else if ((Number(v2[0]) >= 25 && Number(v2[0]) <= 31) && (Number(fundDate2[0]) >= 1 && Number(fundDate2[0]) <= 31)) {
                //     // else if ((array.includes(Number(v3[0])) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31))) {
                //     // let date25 = '10' + '/' + this.getNextMonthName(v2[1]) + '/' + this.getNextYear(v2[1], v3[0]);
                //     let date25 = '10' + '/' + this.getNextMonthNumber(v2[1]) + '/' + this.getNextYear(v2[1], v3[0]);
                //     return date25
                // } else {
                //     // let date25 = '10' + '/' + this.getNextMonthName(v2[1]) + '/' + this.getNextYear(v2[1], v3[0]);
                //     let date25 = '10' + '/' + this.getNextMonthNumber(v2[1]) + '/' + this.getNextYear(v2[1], v3[0]);
                  

                //     return date25
                // }
//UPDATE 5TH FEB

                if ((Number(v2[0]) >= 1 && Number(v2[0]) <= 24) && (Number(fundDate2[0]) >= 1 && Number(fundDate2[0]) <= 15)) {
                    let date10 = '25' + '/' + v2[1] + '/' + v3[0];
                    // + ' ' + v2[3] + ' ' + v2[4];
                    return date10

                } else if ((Number(v2[0]) >= 1 && Number(v2[0]) <= 9) && (Number(fundDate2[0]) >= 16 && Number(fundDate2[0]) <= 31)) {
                    let date25 = '10' + '/' + v2[1] + '/' + v3[0];
                    return date25
                }
                else if ((Number(v2[0]) >= 16 && Number(v2[0]) <= 31) && (Number(fundDate2[0]) >= 16 && Number(fundDate2[0]) <= 31)) {
                    // else if ((array.includes(Number(v3[0])) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31))) {
                    // let date25 = '10' + '/' + this.getNextMonthName(v2[1]) + '/' + this.getNextYear(v2[1], v3[0]);
                    let date25 = '10' + '/' + this.getNextMonthNumber(v2[1]) + '/' + this.getNextYear(v2[1], v3[0]);
                    return date25
                } else {
                    // let date25 = '10' + '/' + this.getNextMonthName(v2[1]) + '/' + this.getNextYear(v2[1], v3[0]);
                    let date25 = '10' + '/' + this.getNextMonthNumber(v2[1]) + '/' + this.getNextYear(v2[1], v3[0]);
                  

                    return date25
                }
            }
        } if (this.dateFormat == 'DD.MM.YYYY' || this.dateFormat == 'DD.MM.yyyy') {
            let v2 = v1.split(".");
            let v3 = v2[2].split(" ");
            let fundDate2 = fundDate1.split(".");
            let fundDate3 = fundDate2[2].split(" ");
            if ((v2[1] == fundDate2[1]) && (v3[0] == fundDate3[0])) {
                if ((Number(v2[0]) >= 1 && Number(v2[0]) <= 24) && (Number(fundDate2[0]) >= 1 && Number(fundDate2[0]) <= 15)) {
                    // if (Number(v2[0]) == 1 || Number(v2[0]) == 2 || Number(v2[0]) == 3 || Number(v2[0]) == 4
                    // || Number(v2[0]) == 5 || Number(v2[0]) == 6 || Number(v2[0]) == 7 || Number(v2[0]) == 8 || Number(v2[0]) == 9 || Number(v2[0]) == 10 || Number(v2[0]) == 11 || Number(v2[0]) == 12 || Number(v2[0]) == 13 || Number(v2[0]) == 14
                    //     || Number(v2[0]) == 15 || Number(v2[0]) == 16 || Number(v2[0]) == 17 || Number(v2[0]) == 18 || Number(v2[0]) == 19 || Number(v2[0]) == 20 || Number(v2[0]) == 21 || Number(v2[0]) == 22 || Number(v2[0]) == 23 || Number(v2[0]) == 24) {

                    // if (Number(v2[0]) == 24 || Number(v2[0]) == 25 || Number(v2[0]) == 26) {
                    // let date25 = '25' + '.' + v2[1] + '.' + v2[2];
                    let date25 = '25' + '.' + v2[1] + '.' + v3[0];
                    return date25
                } else if ((array.includes(Number(v2[0]))) && (Number(fundDate2[0]) >= 16 && Number(fundDate2[0]) <= 31)) {
                    // } else if ((Number(v2[0]) >= 16 && Number(v2[0]) <= 31) && (array.includes(Number(fundDate2[0])))) {

                    // } else if (Number(v2[0]) == 25 || Number(v2[0]) == 26 || Number(v2[0]) == 27 || Number(v2[0]) == 28 || Number(v2[0]) == 29
                    //     || Number(v2[0]) == 30 || Number(v2[0]) == 31) {

                    // } else if (Number(v2[0]) == 9 || Number(v2[0]) == 10 || Number(v2[0]) == 11) {
                    // let date25 = '10' + '.' + v2[1] + '.' + v2[2];
                    let date25 = '10' + '.' + this.getNextMonthNumber(v2[1]) + '.' + this.getNextYear(v2[1], v3[0]);
                    return date25
                } else {
                    let date25 = '10' + '.' + this.getNextMonthNumber(v2[1]) + '.' + this.getNextYear(v2[1], v3[0]);
                    return date25
                }
            } else {
                // if ((Number(v2[0]) >= 1 && Number(v2[0]) <= 9) && (Number(fundDate2[0]) >= 1 && Number(fundDate2[0]) <= 31)) {
                //     let date10 = '10' + '.' + v2[1] + '.' + v3[0];
                //     // + ' ' + v2[3] + ' ' + v2[4];
                //     return date10

                // } else if ((Number(v2[0]) >= 10 && Number(v2[0]) <= 24) && (Number(fundDate2[0]) >= 1 && Number(fundDate2[0]) <= 31)) {
                //     let date25 = '25' + '.' + v2[1] + '.' + v3[0];
                //     return date25
                // }
                // else if ((Number(v2[0]) >= 25 && Number(v2[0]) <= 31) && (Number(fundDate2[0]) >= 1 && Number(fundDate2[0]) <= 31)) {
                //     // else if ((array.includes(Number(v3[0])) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31))) {
                //     let date25 = '10' + '.' + this.getNextMonthNumber(v2[1]) + '.' + this.getNextYear(v2[1], v3[0]);
                //     return date25
                // } else {
                //     let date25 = '10' + '.' + this.getNextMonthNumber(v2[1]) + '.' + this.getNextYear(v2[1], v3[0]);
                //     return date25
                // }
//UPDATE 5TH FEB
                if ((Number(v2[0]) >= 1 && Number(v2[0]) <= 24) && (Number(fundDate2[0]) >= 1 && Number(fundDate2[0]) <= 15)) {
                    let date10 = '25' + '.' + v2[1] + '.' + v3[0];
                    // + ' ' + v2[3] + ' ' + v2[4];
                    return date10

                } else if ((Number(v2[0]) >= 1 && Number(v2[0]) <= 9) && (Number(fundDate2[0]) >= 16 && Number(fundDate2[0]) <= 31)) {
                    let date25 = '10' + '.' + v2[1] + '.' + v3[0];
                    return date25
                }
                else if ((Number(v2[0]) >= 16 && Number(v2[0]) <= 31) && (Number(fundDate2[0]) >= 16 && Number(fundDate2[0]) <= 31)) {
                    // else if ((array.includes(Number(v3[0])) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31))) {
                    let date25 = '10' + '.' + this.getNextMonthNumber(v2[1]) + '.' + this.getNextYear(v2[1], v3[0]);
                    return date25
                } else {
                    let date25 = '10' + '.' + this.getNextMonthNumber(v2[1]) + '.' + this.getNextYear(v2[1], v3[0]);
                    return date25
                }
            }
        } if (this.dateFormat == 'YYYY/MM/DD' || this.dateFormat == 'yyyy/MM/DD') {
            let v2 = v1.split("/");
            let v3 = v2[2].split(" ");
            let fundDate2 = fundDate1.split("/");
            let fundDate3 = fundDate2[2].split(" ");
            if ((v2[1] == fundDate2[1]) && (v2[0] == fundDate2[0])) {
                if ((Number(v3[0]) >= 1 && Number(v3[0]) <= 24) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 15)) {
                    // let date25 = v2[0] + '/' + v2[1] + '/' + '25' + ' ' + v3[1] + v3[2];
                    let date25 = v2[0] + '/' + v2[1] + '/' + '25'
                    // + ' ' + v3[1] + v3[2];
                    return date25
                } else if ((array.includes(Number(v3[0]))) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31)) {
                    // let date25 = v2[0] + '/' + v2[1] + '/' + '10' + ' ' + v3[1] + v3[2];
                    let date25 = this.getNextYear(v2[1], v2[0]) + '/' + this.getNextMonthNumber(v2[1]) + '/' + '10'
                    // + ' ' + v3[1] + v3[2];
                    return date25
                } else {
                    let date25 = this.getNextYear(v2[1], v2[0]) + '/' + this.getNextMonthNumber(v2[1]) + '/' + '10'
                    // + ' ' + v3[1] + v3[2];
                    return date25
                }
            } else {
                // if ((Number(v3[0]) >= 1 && Number(v3[0]) <= ) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 31)) {
                //     let date25 = v2[0] + '/' + v2[1] + '/' + '10'
                //     // + ' ' + v2[3] + ' ' + v2[4];
                //     return date25

                // } else if ((Number(v3[0]) >= 10 && Number(v3[0]) <= 24) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 31)) {
                //     let date25 = v2[0] + '/' + v2[1] + '/' + '25'
                //     return date25
                // }
                // else if ((Number(v3[0]) >= 25 && Number(v3[0]) <= 31) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 31)) {
                //     // else if ((array.includes(Number(v3[0])) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31))) {
                //     let date25 = this.getNextYear(v2[1], v2[0]) + '/' + this.getNextMonthNumber(v2[1]) + '/' + '10'
                //     return date25
                // } else {
                //     let date25 = this.getNextYear(v2[1], v2[0]) + '/' + this.getNextMonthNumber(v2[1]) + '/' + '10'
                //     return date25
                // }
//UPATE 5TH FEB
                if ((Number(v3[0]) >= 1 && Number(v3[0]) <= 24) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 15)) {
                    let date25 = v2[0] + '/' + v2[1] + '/' + '25'
                    // + ' ' + v2[3] + ' ' + v2[4];
                    return date25

                } else if ((Number(v3[0]) >= 1 && Number(v3[0]) <= 9) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31)) {
                    let date25 = v2[0] + '/' + v2[1] + '/' + '10'
                    return date25
                }
                else if ((Number(v3[0]) >= 16 && Number(v3[0]) <= 31) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31)) {
                    // else if ((array.includes(Number(v3[0])) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31))) {
                    let date25 = this.getNextYear(v2[1], v2[0]) + '/' + this.getNextMonthNumber(v2[1]) + '/' + '10'
                    return date25
                } else {
                    let date25 = this.getNextYear(v2[1], v2[0]) + '/' + this.getNextMonthNumber(v2[1]) + '/' + '10'
                    return date25
                }
            }
        } if (this.dateFormat == 'MM/DD/YYYY' || this.dateFormat == 'MM/DD/YYYY') {
            let v2 = v1.split("/");
            let v3 = v2[2].split(" ");
            let fundDate2 = fundDate1.split("/");
            let fundDate3 = fundDate2[2].split(" ");
            if ((v2[0] == fundDate2[0]) && (v3[0] == fundDate3[0])) {
                if ((Number(v2[1]) >= 1 && Number(v2[1]) <= 24) && (Number(fundDate2[1]) >= 1 && Number(fundDate2[1]) <= 15)) {
                  
                    // if (Number(v2[1]) == 1 || Number(v2[1]) == 2 || Number(v2[1]) == 3 || Number(v2[1]) == 4
                    // || Number(v2[1]) == 5 || Number(v2[1]) == 6 || Number(v2[1]) == 7 || Number(v2[1]) == 8 || Number(v2[1]) == 9 || Number(v2[1]) == 10 || Number(v2[1]) == 11 || Number(v2[1]) == 12 || Number(v2[1]) == 13 || Number(v2[1]) == 14
                    //     || Number(v2[1]) == 15 || Number(v2[1]) == 16 || Number(v2[1]) == 17 || Number(v2[1]) == 18 || Number(v2[1]) == 19 || Number(v2[1]) == 20 || Number(v2[1]) == 21 || Number(v2[1]) == 22 || Number(v2[1]) == 23 || Number(v2[1]) == 24) {
                    // if (Number(v2[1]) == 24 || Number(v2[1]) == 25 || Number(v2[1]) == 26) {
                    // let date25 = v2[0] + '/' + '25' + '/' + v2[2];
                    let date25 = v2[0] + '/' + '25' + '/' + v3[0];
                    return date25
                } else if ((array.includes(Number(v2[1]))) && (Number(fundDate2[1]) >= 16 && Number(fundDate2[1]) <= 31)) {
                 


                    // } else if ((Number(v2[1]) >= 16 && Number(v2[1]) <= 31) && (array.includes(Number(fundDate2[1])))) {

                    // } else if (Number(v2[1]) == 25 || Number(v2[1]) == 26 || Number(v2[1]) == 27 || Number(v2[1]) == 28 || Number(v2[1]) == 29
                    //     || Number(v2[1]) == 30 || Number(v2[1]) == 31) {

                    // } else if (Number(v2[1]) == 9 || Number(v2[1]) == 10 || Number(v2[1]) == 11) {
                    // let date25 = v2[0] + '/' + '10' + '/' + v2[2];
                    let date25 = this.getNextMonthNumber(v2[0]) + '/' + '10' + '/' + this.getNextYear(v2[0], v3[0]);
                    return date25
                } else {
                    

                    let date25 = this.getNextMonthNumber(v2[0]) + '/' + '10' + '/' + this.getNextYear(v2[0], v3[0]);
                    return date25
                }
            } else {
              
                
                // old 
                // if ((Number(v2[1]) >= 1 && Number(v2[1]) <= 9) && (Number(fundDate2[1]) >= 1 && Number(fundDate2[1]) <= 31)) {
                //     let date25 = v2[0] + '/' + '10' + '/' + v3[0];
                //     console.log(Number(v2[1]), Number(v2[1]) ,Number(fundDate2[1]) ,Number(fundDate2[1]),'100000');
                //     console.log('fundate 10 next',fundDate1)
                  
                //     return date25

                // } else if ((Number(v2[1]) >= 10 && Number(v2[1]) <= 24) && (Number(fundDate2[1]) >= 1 && Number(fundDate2[1]) <= 31)) {
                //     let date25 = v2[0] + '/' + '25' + '/' + v3[0];
                //     return date25
                // }
                // else if ((Number(v2[1]) >= 25 && Number(v2[1]) <= 31) && (Number(fundDate2[1]) >= 1 && Number(fundDate2[1]) <= 31)) {
                //     let date25 = this.getNextMonthNumber(v2[0]) + '/' + '10' + '/' + this.getNextYear(v2[0], v3[0]);
                //     return date25
                // } else {
                //     let date25 = this.getNextMonthNumber(v2[0]) + '/' + '10' + '/' + this.getNextYear(v2[0], v3[0]);
                //     return date25
                // }
                // 
                if ((Number(v2[1]) >= 1 && Number(v2[1]) <= 24) && (Number(fundDate2[1]) >= 1 && Number(fundDate2[1]) <= 15)) {
                    let date25 = v2[0] + '/' + '25' + '/' + v3[0];
                   
                  
                    return date25

                } else if ((Number(v2[1]) >= 1 && Number(v2[1]) <= 9) && (Number(fundDate2[1]) >= 16 && Number(fundDate2[1]) <= 31)) {
                    let date25 = v2[0] + '/' + '10' + '/' + v3[0];
                    return date25
                }
                else if ((Number(v2[1]) >= 16 && Number(v2[1]) <= 31) && (Number(fundDate2[1]) >= 16 && Number(fundDate2[1]) <= 31)) {
                    let date25 = this.getNextMonthNumber(v2[0]) + '/' + '10' + '/' + this.getNextYear(v2[0], v3[0]);
                    return date25
                } else {
                    let date25 = this.getNextMonthNumber(v2[0]) + '/' + '10' + '/' + this.getNextYear(v2[0], v3[0]);
                    return date25
                }
                // 
            }
        } else {
            return ''
        }


    }


    // // 
    // getAgentPaidDate(paiddate: any, fundDate: any) {
    //     let v1 = moment(paiddate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
    //     let fundDate1 = moment(fundDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`);
    //  const array = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25,26,27,28,29,30,31,1, 2, 3, 4, 5, 6, 7, 8, 9]
    //     if (this.dateFormat == 'MMM DD, YYYY' || this.dateFormat == 'MMM DD, yyyy') {
    //         let v2 = v1.split(" ");
    //         let v3 = v2[1].split(',');
    //         let fundDate2 = fundDate1.split(" ");
    //         let fundDate3 = fundDate2[1].split(',');
    //         if((Number(v3[0]) >= 1 && Number(v3[0]) <= 24) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 15)){
    //         // if (Number(v3[0]) == 1 || Number(v3[0]) == 2 || Number(v3[0]) == 3 || Number(v3[0]) == 4
    //         // || Number(v3[0]) == 5 || Number(v3[0]) == 6 || Number(v3[0]) == 7 || Number(v3[0]) == 8 || Number(v3[0]) == 9 || Number(v3[0]) == 10 || Number(v3[0]) == 11 || Number(v3[0]) == 12 || Number(v3[0]) == 13 || Number(v3[0]) == 14
    //         //     || Number(v3[0]) == 15 || Number(v3[0]) == 16 || Number(v3[0]) == 17 || Number(v3[0]) == 18 || Number(v3[0]) == 19 || Number(v3[0]) == 20 || Number(v3[0]) == 21 || Number(v3[0]) == 22 || Number(v3[0]) == 23 || Number(v3[0]) == 24) {
    //             let date25 = v2[0] + ' ' + '25,' + ' ' + v2[2]
    //             // + ' ' + v2[3] + ' ' + v2[4];
    //             return date25
    //         } else if ((array.includes(Number(v3[0])) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31))) {
    //         // } else if (Number(v3[0]) == 25 || Number(v3[0]) == 26 || Number(v3[0]) == 27 || Number(v3[0]) == 28 || Number(v3[0]) == 29
    //         //     || Number(v3[0]) == 30 || Number(v3[0]) == 31) {

    //             // let date25 = v2[0] + ' ' + '10,' + ' ' + v2[2] + ' ' + v2[3] + ' ' + v2[4];
    //             let date25 = this.getNextMonthName(v2[0]) + ' ' + '10,' + ' ' + this.getNextYear(v2[0],v2[2])
    //             //  + ' ' + v2[3] + ' ' + v2[4];
    //             return date25
    //         } else {
    //             let date25 = this.getNextMonthName(v2[0]) + ' ' + '10,' + ' ' + this.getNextYear(v2[0],v2[2])
    //             //  + ' ' + v2[3] + ' ' + v2[4];
    //             return date25
    //         }
    //     } if (this.dateFormat == 'DD/MM/YYYY' || this.dateFormat == 'DD/MM/YYYY') {
    //         let v2 = v1.split("/");
    //         let v3 = v2[2].split(" ");
    //         let fundDate2 = fundDate1.split("/");
    //      //   let fundDate3 = fundDate2[2].split(" ");
    //         if((Number(v2[0]) >= 1 && Number(v2[0]) <= 24) && (Number(fundDate2[0]) >= 1 && Number(fundDate2[0]) <= 15)){
    //         // if (Number(v2[0]) == 1 || Number(v2[0]) == 2 || Number(v2[0]) == 3 || Number(v2[0]) == 4
    //         // || Number(v2[0]) == 5 || Number(v2[0]) == 6 || Number(v2[0]) == 7 || Number(v2[0]) == 8 || Number(v2[0]) == 9 || Number(v2[0]) == 10 || Number(v2[0]) == 11 || Number(v2[0]) == 12 || Number(v2[0]) == 13 || Number(v2[0]) == 14
    //         //     || Number(v2[0]) == 15 || Number(v2[0]) == 16 || Number(v2[0]) == 17 || Number(v2[0]) == 18 || Number(v2[0]) == 19 || Number(v2[0]) == 20 || Number(v2[0]) == 21 || Number(v2[0]) == 22 || Number(v2[0]) == 23 || Number(v2[0]) == 24) {


    //             // if (Number(v2[0]) == 24 || Number(v2[0]) == 25 || Number(v2[0]) == 26) {
    //             // let date25 = '25' + '/' + v2[1] + '/' + v2[2];
    //             let date25 = '25' + '/' + v2[1] + '/' + v3[0];
    //             return date25
    //         } else if ((array.includes(Number(v2[0])) &&(Number(fundDate2[0]) >= 16 && Number(fundDate2[0]) <= 31))) {
    //     //     } else if ((Number(v2[0]) >= 16 && Number(v2[0]) <= 31) && (array.includes(Number(fundDate2[0])))) {
    //         // } else if (Number(v2[0]) == 25 || Number(v2[0]) == 26 || Number(v2[0]) == 27 || Number(v2[0]) == 28 || Number(v2[0]) == 29
    //         //     || Number(v2[0]) == 30 || Number(v2[0]) == 31) {

    //             // } else if (Number(v2[0]) == 9 || Number(v2[0]) == 10 || Number(v2[0]) == 11) {
    //             // let date25 = '10' + '/' + v2[1] + '/' + v2[2];
    //             let date25 = '10' + '/' + this.getNextMonthNumber(v2[1]) + '/' + this.getNextYear(v2[1],v3[0]);
    //             return date25
    //         } else {
    //             let date25 = '10' + '/' + this.getNextMonthNumber(v2[1]) + '/' + this.getNextYear(v2[1],v3[0]);
    //             return date25
    //         }
    //     } if (this.dateFormat == 'DD.MM.YYYY' || this.dateFormat == 'DD.MM.yyyy') {
    //         let v2 = v1.split(".");
    //         let v3 = v2[2].split(" ");
    //         let fundDate2 = fundDate1.split(".");
    //         let fundDate3 = fundDate2[2].split(" ");
    //         if((Number(v2[0]) >= 1 && Number(v2[0]) <= 24) && (Number(fundDate2[0]) >= 1 && Number(fundDate2[0]) <= 15)){
    //         // if (Number(v2[0]) == 1 || Number(v2[0]) == 2 || Number(v2[0]) == 3 || Number(v2[0]) == 4
    //         // || Number(v2[0]) == 5 || Number(v2[0]) == 6 || Number(v2[0]) == 7 || Number(v2[0]) == 8 || Number(v2[0]) == 9 || Number(v2[0]) == 10 || Number(v2[0]) == 11 || Number(v2[0]) == 12 || Number(v2[0]) == 13 || Number(v2[0]) == 14
    //         //     || Number(v2[0]) == 15 || Number(v2[0]) == 16 || Number(v2[0]) == 17 || Number(v2[0]) == 18 || Number(v2[0]) == 19 || Number(v2[0]) == 20 || Number(v2[0]) == 21 || Number(v2[0]) == 22 || Number(v2[0]) == 23 || Number(v2[0]) == 24) {

    //             // if (Number(v2[0]) == 24 || Number(v2[0]) == 25 || Number(v2[0]) == 26) {
    //             // let date25 = '25' + '.' + v2[1] + '.' + v2[2];
    //             let date25 = '25' + '.' + v2[1] + '.' + v3[0];
    //             return date25
    //         } else if ((array.includes(Number(v2[0]))) && (Number(fundDate2[0]) >= 16 && Number(fundDate2[0]) <= 31)) {
    //         // } else if ((Number(v2[0]) >= 16 && Number(v2[0]) <= 31) && (array.includes(Number(fundDate2[0])))) {

    //         // } else if (Number(v2[0]) == 25 || Number(v2[0]) == 26 || Number(v2[0]) == 27 || Number(v2[0]) == 28 || Number(v2[0]) == 29
    //         //     || Number(v2[0]) == 30 || Number(v2[0]) == 31) {

    //             // } else if (Number(v2[0]) == 9 || Number(v2[0]) == 10 || Number(v2[0]) == 11) {
    //             // let date25 = '10' + '.' + v2[1] + '.' + v2[2];
    //             let date25 = '10' + '.' + this.getNextMonthNumber(v2[1]) + '.' + this.getNextYear(v2[1],v3[0]);
    //             return date25
    //         } else {
    //             let date25 = '10' + '.' + this.getNextMonthNumber(v2[1]) + '.' + this.getNextYear(v2[1],v3[0]);
    //             return date25
    //         }
    //     } if (this.dateFormat == 'YYYY/MM/DD' || this.dateFormat == 'yyyy/MM/DD') {
    //         let v2 = v1.split("/");
    //         let v3 = v2[2].split(" ");
    //         let fundDate2 = fundDate1.split("/");
    //         let fundDate3 = fundDate2[2].split(" ");
    //         if((Number(v3[0]) >= 1 && Number(v3[0]) <= 24) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 15)){
    //         // if (Number(v3[0]) == 1 || Number(v3[0]) == 2 || Number(v3[0]) == 3 || Number(v3[0]) == 4
    //         // || Number(v3[0]) == 5 || Number(v3[0]) == 6 || Number(v3[0]) == 7 || Number(v3[0]) == 8 || Number(v3[0]) == 9 || Number(v3[0]) == 10 || Number(v3[0]) == 11 || Number(v3[0]) == 12 || Number(v3[0]) == 13 || Number(v3[0]) == 14
    //         //     || Number(v3[0]) == 15 || Number(v3[0]) == 16 || Number(v3[0]) == 17 || Number(v3[0]) == 18 || Number(v3[0]) == 19 || Number(v3[0]) == 20 || Number(v3[0]) == 21 || Number(v3[0]) == 22 || Number(v3[0]) == 23 || Number(v3[0]) == 24) {

    //             // if (Number(v3[0]) == 24 || Number(v3[0]) == 25 || Number(v3[0]) == 26) {
    //             // let date25 = v2[0] + '/' + v2[1] + '/' + '25' + ' ' + v3[1] + v3[2];
    //             let date25 = v2[1] + '/' + v2[1] + '/' + '25'
    //             // + ' ' + v3[1] + v3[2];
    //             return date25
    //         } else if ((array.includes(Number(v3[0]))) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31)) {
    //         // } else if ((Number(v3[0]) >= 16 && Number(v3[0]) <= 31) && (array.includes(Number(fundDate3[0])))) {
    //         // } else if (Number(v3[0]) == 25 || Number(v3[0]) == 26 || Number(v3[0]) == 27 || Number(v3[0]) == 28 || Number(v3[0]) == 29
    //         //     || Number(v3[0]) == 30 || Number(v3[0]) == 31) {

    //             // } else if (Number(v3[0]) == 9 || Number(v3[0]) == 10 || Number(v3[0]) == 11) {
    //             // let date25 = v2[0] + '/' + v2[1] + '/' + '10' + ' ' + v3[1] + v3[2];
    //             let date25 = this.getNextYear(v2[1],v2[0]) + '/' + this.getNextMonthNumber(v2[1]) + '/' + '10'
    //             // + ' ' + v3[1] + v3[2];
    //             return date25
    //         } else {
    //             let date25 = this.getNextYear(v2[1],v2[0]) + '/' + this.getNextMonthNumber(v2[1]) + '/' + '10'
    //             // + ' ' + v3[1] + v3[2];
    //             return date25
    //         }
    //     } if (this.dateFormat == 'MM/DD/YYYY' || this.dateFormat == 'MM/DD/YYYY') {
    //         let v2 = v1.split("/");
    //         let v3 = v2[2].split(" ");
    //         let fundDate2 = fundDate1.split("/");
    //         let fundDate3 = fundDate2[2].split(" ");
    //         if((Number(v2[1]) >= 1 && Number(v2[1]) <= 24) && (Number(fundDate2[1]) >= 1 && Number(fundDate2[1]) <= 15)){

    //         // if (Number(v2[1]) == 1 || Number(v2[1]) == 2 || Number(v2[1]) == 3 || Number(v2[1]) == 4
    //         // || Number(v2[1]) == 5 || Number(v2[1]) == 6 || Number(v2[1]) == 7 || Number(v2[1]) == 8 || Number(v2[1]) == 9 || Number(v2[1]) == 10 || Number(v2[1]) == 11 || Number(v2[1]) == 12 || Number(v2[1]) == 13 || Number(v2[1]) == 14
    //         //     || Number(v2[1]) == 15 || Number(v2[1]) == 16 || Number(v2[1]) == 17 || Number(v2[1]) == 18 || Number(v2[1]) == 19 || Number(v2[1]) == 20 || Number(v2[1]) == 21 || Number(v2[1]) == 22 || Number(v2[1]) == 23 || Number(v2[1]) == 24) {
    //             // if (Number(v2[1]) == 24 || Number(v2[1]) == 25 || Number(v2[1]) == 26) {
    //             // let date25 = v2[0] + '/' + '25' + '/' + v2[2];
    //             let date25 = v2[0] + '/' + '25' + '/' + v3[0];
    //             return date25
    //         } else if ((array.includes(Number(v2[1]))) && (Number(fundDate2[1]) >= 16 && Number(fundDate2[1]) <= 31)) {
    //         // } else if ((Number(v2[1]) >= 16 && Number(v2[1]) <= 31) && (array.includes(Number(fundDate2[1])))) {

    //         // } else if (Number(v2[1]) == 25 || Number(v2[1]) == 26 || Number(v2[1]) == 27 || Number(v2[1]) == 28 || Number(v2[1]) == 29
    //         //     || Number(v2[1]) == 30 || Number(v2[1]) == 31) {

    //             // } else if (Number(v2[1]) == 9 || Number(v2[1]) == 10 || Number(v2[1]) == 11) {
    //             // let date25 = v2[0] + '/' + '10' + '/' + v2[2];
    //             let date25 = this.getNextMonthNumber(v2[0]) + '/' + '10' + '/' + this.getNextYear(v2[0],v3[0]);
    //             return date25
    //         } else {
    //             let date25 = this.getNextMonthNumber(v2[0]) + '/' + '10' + '/' + this.getNextYear(v2[0],v3[0]);
    //             return date25
    //         }
    //     } else {
    //         return ''
    //     }


    // }
    getNextMonthName(month: any) {
        if (month == 'Jan') {
            return 'Feb'
        } else if (month == 'Feb') {
            return 'Mar'
        } else if (month == 'Mar') {
            return 'Apr'
        } else if (month == 'Apr') {
            return 'May'
        } else if (month == 'May') {
            return 'Jun'
        } else if (month == 'Jun') {
            return 'Jul'
        } else if (month == 'Jul') {
            return 'Aug'
        } else if (month == 'Aug') {
            return 'Sep'
        } else if (month == 'Sep') {
            return 'Oct'
        } else if (month == 'Oct') {
            return 'Nov'
        } else if (month == 'Nov') {
            return 'Dec'
        } else if (month == 'Dec') {
            return 'Jan'
        }
        return month

    }
    getNextYear(month: any, year: any) {
        if (month == 'Dec' || Number(month) == 12) {
            return Number(year) + 1
        } else {
            return year
        }
    }
    getNextMonthNumber(month: any) {
        if (Number(month == 12)) {
            return '01'
        } else {
            if (Number(month) >= 1 && Number(month <= 9)) {
                return '0' + (Number(month) + 1)
            } else {
                return Number(month) + 1
            }
        }

    }
    sortBy(col: string) {
        if (!this.usersList.length) {
            return;
        }
        if (this.search.sortby === col) {
            if (this.search.order === 'ASC') {
                this.search.order = 'DESC'
            } else {
                this.search.order = 'ASC'
            }
        } else {
            this.search.order = 'DESC';
            this.search.sortby = col;
        }
        this.getUsersList();

    }


    onChange(id: any, target: EventTarget | null, index: number) {

        const input = target as HTMLInputElement;
        if (input.checked) {
            this.usersList[index].toggle = true;
            if (!this.payrollIdArray.includes(id)) {
                this.payrollIdArray.push(id);
            }
        } else {
            this.usersList[index].toggle = false;

            let i = this.payrollIdArray.findIndex(x => x === id);
            if (i > -1) {
                this.payrollIdArray.splice(i, 1);
            }
        }
    }

    onCheckingAll(target: any) {
        this.payrollIdArray = [];
        for (let i = 0; i < this.usersList.length; i++) {
            this.usersList[i].selected = target.checked;
            if (target.checked) {
                this.boo = true;

                this.usersList[i].toggle = true;
                this.payrollIdArray.push(this.usersList[i].id);
            } else {
                this.usersList[i].toggle = false;
                this.boo = false;



            }
        }

        // this.boo = false;
    }
    /**
 * @description export leads as excel file,(export all leads if not selected particular lead)
 */
    async exportLeadasExcel() {
        try {
            if (!this.payrollIdArray.length) {
                this.commonService.showError("Please select any payroll");
                return
            }
            let selectedLeads = '';
            if (this.payrollIdArray.length) {
                selectedLeads = this.payrollIdArray.join();
            }
            const res = await this.getLeadsDataForExport(selectedLeads);
            if (res.length) {
                this.excelService.exportAsExcelPayrollFile(res, 'Payroll');
            } else {
                this.commonService.showError("No data found");
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    /**
* @description export leads as excel file,(export all leads if not selected particular lead)
*/
    async markAllAsPaid() {
        try {
            if (!this.payrollIdArray.length) {
                this.commonService.showError("Please select any payroll");
                return
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(
                API_PATH.PAYROLL_MARK_AS_PAID,
                { id: this.payrollIdArray },
                'lead', 'pre-funding'
            );
            let response = await lastValueFrom(res$);
            if (response) {
                this.commonService.showSuccess(response.message);
                this.getUsersList();
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

    async getLeadsDataForExport(url: string) {
        try {
            // let leads = '';
            // if (url) {
            //     leads = `?export_lead=[${url}]`;
            // }

            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.EXPORT_PAYROLL, { export_payroll: this.payrollIdArray }, 'payroll', 'export');
            const response = await lastValueFrom(res$);
            this.commonService.hideSpinner();
            let modifiedRes = [];

            for (let i = 0; i < response.data.length; i++) {
                let assgnTo = '';
                for (let index = 0; index < response.data[i]['Assigned to'].length; index++) {
                    let x = response.data[i]['Assigned to'][index].upfront_commission ? `(${response.data[i]['Assigned to'][index].upfront_commission})%` : '';
                    // let data = `${response.data[i]['Assigned to'][index].agent_name} : ${this.getamount(response.data[i]['Assigned to'][index].lender_commission, response.data[i]['Assigned to'][index].upfront_broker_commission)} ${x} \n`
                    let data = `${response.data[i]['Assigned to'][index].agent_name} : ${this.getamountExport(response.data[i]['Assigned to'][index].lender_commission, response.data[i]['Assigned to'][index].upfront_broker_commission)} ${x} \n`
                    assgnTo = assgnTo + data
                }

                modifiedRes.push({
                    ...response.data[i],
                    'Assigned to': assgnTo,
                    'Agent paid date': response.data[i]['Company paid status'] == 'paid' ? this.getAgentPaidDate(response.data[i]['Agent paid date'], response.data[i]['Funding date']) : '-',
                    'Funding date': this.getDate(response.data[i]['Funding date']),
                    'Created at': this.getDate(response.data[i]['Created at'])
                    // 'Agent paid date': response.data[i]['Company paid status'] == 'paid'?this.getAgentPaidDate(response.data[i]['Agent paid date']):'-' 
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

    // getCommissionVal(user: any){
    //     //  console.log(user,'Usersssssssssssssssssss');
    //     let lenderCommValue = 0;
    //     let upFrontCommValue = 0;
    //     let upfront_broker_commission = 0;
    //     let upfront_fee = 0;
    //     // upfront_broker_commission = user?.upfront_broker_commission 
    //     upfront_broker_commission = user?.upfront_broker_commission - (user?.funding_amount * (user?.total_points - user?.retail_points)/100)
    //     upfront_fee = user?.upfront_fee;

    //     for(let agent of user.assigned_to){
    //         lenderCommValue += upfront_broker_commission * agent.lender_commission / 100;
    //         // upFrontCommValue +=upfront_broker_commission * agent.upfront_commission / 100;
    //         upFrontCommValue += upfront_fee * agent.upfront_commission / 100;
    //     }
    //     this.totalCommission = lenderCommValue +  upFrontCommValue;
    //     let netProfit = ((Number(upfront_broker_commission) + Number(upfront_fee)) - this.totalCommission);


    //    return netProfit

    //   }
    getCommissionVal(user: any) {
        let lenderCommValue = 0;
        let upFrontCommValue = 0;
        let upfront_broker_commission = 0;
        let upfront_fee = 0;
        let earlierUpfrontBrkrCmsn = user?.upfront_broker_commission
        let assignedISocommisison = 0;
        upfront_broker_commission = user?.upfront_broker_commission - (user?.funding_amount * (user?.total_points - user?.retail_points) / 100)
        upfront_fee = user?.upfront_fee;

        for (let agent of user.assigned_to) {
            if (agent?.agent_type == 'Assigned ISO') {
                assignedISocommisison = (user?.funding_amount / 100) * agent.lender_commission
            } else if (agent?.agent_type != 'Assigned ISO') {
                if(user.agent_commision === 'percentage'){

                lenderCommValue += upfront_broker_commission * agent.lender_commission / 100;
                // upFrontCommValue +=upfront_broker_commission * agent.upfront_commission / 100;
                upFrontCommValue += upfront_fee * agent.upfront_commission / 100;
                }else{
                    lenderCommValue +=  Number(agent.lender_commission) ;
                    upFrontCommValue +=  Number(agent.upfront_commission) ;

                }
            }
        }
        this.totalCommission = lenderCommValue + upFrontCommValue + assignedISocommisison;
        let netProfit = ((Number(earlierUpfrontBrkrCmsn) + Number(upfront_fee)) - this.totalCommission);
        return netProfit

    }
    getHouseNetPercenatge(netprofit: any, user: any) {
        if(user.agent_commision === 'percentage'){

        let percenatge = (netprofit * 100) / (Number(user?.upfront_broker_commission) + Number(user?.upfront_fee))
        return '(' + (percenatge.toFixed(2)) + ')';
        }else{
            
        let percenatge = (netprofit * 100) / (Number(user?.upfront_broker_commission) + Number(user?.upfront_fee))
        return '(' + (percenatge.toFixed(2)) + ')';

        }
    }
    changePayroll() {
        if (this.tempFilter['Payroll'].value && this.tempFilter['Payroll'].value.name == 'Existing Payroll') {
            this.showPayroll = true;
            this.tempFilter['Date'].value = null;
        } else {
            this.showPayroll = false
        }
        //    this.getUsersList();
        this.onSearch();

    }
    getPercentage(data: any,user:any) {
        if (data?.agent_type != "Assigned ISO") {
            if(user.agent_commision === 'percentage'){

            let brokerCalculatedValue = Number(data?.funding_amount) * (Number(data?.total_points - data?.retail_points) / 100);
            let brokerCommission = Number(data?.upfront_broker_commission) - brokerCalculatedValue;
            let total_lenderCommisison = brokerCommission * Number(data?.lender_commission) / 100;
            let total_upfront_fee = Number(data?.upfront_fee) * Number(data?.upfront_commission) / 100;
            let final_total = Number(total_lenderCommisison + total_upfront_fee);
            let totalEarning = (Number(data?.upfront_broker_commission) + Number(data?.upfront_fee))

           let fianlData = (Number(final_total * 100) / totalEarning).toFixed(2);
           if(fianlData){

               return '(' + (Number(final_total * 100) / totalEarning).toFixed(2) + ')' + '%'
           }else{
            return '(' + 0 + ')' + '%'
           }
        }else{
            let total_lenderCAndUpforntCmsn =  Number(data?.lender_commission) + Number(data?.upfront_commission) ;
            let total_upfront_fee = Number(data?.upfront_broker_commission) + Number(data?.upfront_fee) ;
         
            return '(' + ((total_lenderCAndUpforntCmsn*100)/total_upfront_fee).toFixed(2) + ')' + '%'

        }
            
        } else {
            return '(' + 0 + ')' + '%'
        }

    }

    async getuserListing() {
        try {
            let url = `?sort_by=first_name&dir=ASC&page_limit=2000&page=${this.userListingPage}&status=Active`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.USERS_LIST + url, 'payroll',
                'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                // this.hasMoreUsers = response.data.hasMorePages;
                // if (this.userListingPage == 1) {
                this.usersListing = response.data.data;
                // } else {
                //     this.usersList = [...this.usersList, ...response.data.data];
                // }

            } else {
                this.usersListing = [];
            }
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    /*
         // reference for 2nd previous month calculate payroll-list  (date format):- this.dateFormat == 'MMM DD, YYYY' || this.dateFormat == 'MMM DD, yyyy'
         start:-
         let fundingDate  = new Date(fundDate);  these two dates are global date
         let todayDate = new Date(paiddate);
    
    
         if(fundingDate.getMonth() == todayDate.getMonth()){
    
      // all previous code working
      date calculate for payroll-list
    
     } else {
         
         if((Number(v3[0]) >= 1 && Number(v3[0]) <= 9) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 31)){
             let date10 = v2[0] + ' ' + '10,' + ' ' + v2[2]
             // + ' ' + v2[3] + ' ' + v2[4];
             return date10
          
         }else if((Number(v3[0]) >= 10 && Number(v3[0]) <= 24) && (Number(fundDate3[0]) >= 1 && Number(fundDate3[0]) <= 31)){
             let date25 = v2[0] + ' ' + '25,' + ' ' + v2[2]
             return date25
         }
         else if ((array.includes(Number(v3[0])) && (Number(fundDate3[0]) >= 16 && Number(fundDate3[0]) <= 31))) {
                 let date25 = this.getNextMonthName(v2[0]) + ' ' + '10,' + ' ' + this.getNextYear(v2[0],v2[2])
                 return date25
             } else {
                 let date25 = this.getNextMonthName(v2[0]) + ' ' + '10,' + ' ' + this.getNextYear(v2[0],v2[2])
                 return date25
             }
     
     }
     */
    getAgentFeePaidDate(paiddate:any){
     
            // console.log(paiddate,'sjhdsjhdgsd'); .tz(this.timeZone)
            
            let formatDate = moment(paiddate).format(`${this.dateFormat}`);
          return formatDate;
    }
}

