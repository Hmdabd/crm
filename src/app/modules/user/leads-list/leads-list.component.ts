import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import * as Constants from '@constants/constants';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';
import swal from 'sweetalert2';

@Component({
    selector: 'app-leadsss-list',
    templateUrl: './leads-list.component.html',
    styleUrls: ['../../../styles/dashboard.scss']
})
export class LeadsListComponent implements OnInit {
    roles = Constants.Roles;
    userRole: string = '';
    dashboardData: any = {};
    advanceSearchToggle: boolean = false;
    recordsPerPage: number = 10;
    leadsList: Array<any> = [];
    totalRecords: number = 0;
    page: number = 1;
    searchKeyword: string = '';
    //daterangepicker
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    selectedDate: any = '';
    maxDate!: NgbDateStruct;
    campaignList: Array<any> = [];
    leadStatusList: Array<any> = [];
    leadSourceList: Array<any> = [];
    managersList: Array<any> = [];
    usersList: Array<any> = [];
    leadIdArray: Array<any> = [];
    dateFormat: string = ""
    @ViewChild('datepicker') datepicker: any;
    @ViewChild('selectAll') selectAll!: ElementRef;

    hasMoreUsers: boolean = false;
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    companiesList: Array<any> = [];
    userListPage: number = 1;
    status: string = '';
    userDetails: any = {};

    tempFilter: { [key: string]: any } = {
        "Search": { value: "" },
        "Date": { value: "" },
        "Status": { value: null },
        "Full name": { value: "" },
        "Phone": { value: "" },
        "Email": { value: "" },
        "Exclusive lead": { value: null },
        "ID": { value: "" },
        "Company name": { value: "" },
        "Disposition": { value: null },
        "Manager": { value: null },
        "User": { value: null },
        "ISO": { value: null },
        "Compaign": { value: null },
        "Company": { value: null }
    }

    appliedFilter: { [key: string]: any } = {
    }
    color!: string;

    constructor(
        private authService: AuthService,
        private commonService: CommonService,
        private apiService: ApiService,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.tempFilter['Search'].value = params['search'];
                if (this.tempFilter['Search'].value) {
                    this.onSearch();
                } else {
                    this.getLeadsList();
                }

            }
            );



        this.maxDate = this.calendar.getToday();
        this.getLeadOptions();
        this.getUserDetails();
        this.getManagersList();
        this.getUsersList();
        this.getCompaniesList();
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
    async getCompaniesList() {
        try {
            let url = `?page_limit=${this.usersListLimit}&page=${this.userListPage}&role=${Constants.Roles.COMPANY}&status=Active`;
            if (this.searchKeyword) {
                url = url + `&search_keyword=${this.searchKeyword}`
            }
            const res$ = this.apiService.getReq(API_PATH.ADMIN_LISTS + url, 'company', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                this.totalUsersCount = response.data.total;
                response.data.data = response.data.data.map((e: any) => ({ ...e, name: e.first_name + ' ' + e.last_name }))
                if (this.userListPage === 1) {
                    this.companiesList = response.data.data;
                } else {
                    this.companiesList = [...this.companiesList, ...response.data.data];
                }

            } else {
                this.companiesList = [];
                this.hasMoreUsers = false;
                this.userListPage = 1;
            }
        } catch (error: any) {
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }

    /**
     * @description remve filter
     * @param key 
     */
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
        this.page = 1;
        this.appliedFilter = JSON.parse(JSON.stringify(this.tempFilter));
        this.getLeadsList();
    }

    /**
     * @description on Status Change
     */
    onStatusChange() {
        this.onSearch();
    }

    /**
     * @description reset filter
     */
    resetFilter() {
        this.selectedDate = '';
        this.fromDate = null;
        this.toDate = null;
        for (const p in this.tempFilter) {
            this.tempFilter[p].value = null;
        }
        this.onSearch();
    }

    /**
     * 
     */
    getMoreCompanies() {
        if (this.hasMoreUsers) {
            this.userListPage++
            this.getCompaniesList();
        }
    }

    /**
     * 
     * @param search 
     */
    onCompanySearch(search: any) {
        this.searchKeyword = search.term;
        this.usersListLimit = 1;
        this.getCompaniesList();
    }

    async getManagersList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + `?role=${Constants.Roles.BRANCHMANAGER}`, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.managersList = response.data;

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

    async getUsersList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LIST_FOR_USERS + `?role=${Constants.Roles.UNDERWRITER}`, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.usersList = response.data;
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
     * @description on click of delete actoion
     */
    deleteMultipleLeads() {
        if (this.leadIdArray.length) {
            swal.fire({
                title: 'Are you sure to delete?',
                text: 'You will not be able to revert this!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Delete',
                confirmButtonColor: this.color,
                cancelButtonText: 'Cancel',
                backdrop: true,
                allowOutsideClick: false,
            }).then((result) => {
                if (result.value) {
                    this.deleteLead(this.leadIdArray);
                }
            })
        } else {
            this.commonService.showError("Please select atleast one lead.")
        }
    }

    /**
     * @description delete single lead
     */
    async deleteSingleLead(id: string) {
        this.deleteLead([id]);
    }

    async deleteLead(ids: Array<string>): Promise<void> {
        try {
            if (!ids.length) {
                return;
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DELETE_LEADS, { delete_id: ids }, 'lead', 'delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                this.leadsList = this.leadsList.filter(el => !ids.includes(el.id));
                this.leadIdArray = [];
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

    onChange(id: any, target: EventTarget | null) {
        const input = target as HTMLInputElement;
        if (input.checked) {
            if (!this.leadIdArray.includes(id)) {
                this.leadIdArray.push(id);
            }
        } else {
            let i = this.leadIdArray.findIndex(x => x === id);
            if (i > -1) {
                this.leadIdArray.splice(i, 1);
            }
        }
    }

    onCheckingAll(target: any) {
        this.leadIdArray = [];
        for (let i = 0; i < this.leadsList.length; i++) {
            this.leadsList[i].selected = target.checked;
            if (target.checked) {
                this.leadIdArray.push(this.leadsList[i].id);
            }
        }
    }

    /**
     * @description lead options
     */
    async getLeadOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadSourceList = response.data.lead_source;
                this.leadSourceList.sort((a, b) => a.name.localeCompare(b.name))
                this.leadStatusList = response.data.status;
                this.leadStatusList.sort((a, b) => a.name.localeCompare(b.name))
                this.campaignList = response.data.campaign
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

    onDateSelection(date: NgbDate) {
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
                this.tempFilter['Date'].value = this.selectedDate;
                this.onSearch();
            }
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
                this.userRole = ud.role;
                this.dateFormat = ud.date_format;
                this.color = ud?.color;
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    /**
     * @description get leads listing
     */
    async getLeadsList() {

        let url = `?records_per_page=${this.recordsPerPage}&page=${this.page}`;

        if (this.appliedFilter['Date']?.value) {
            url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
        }
     
        if (this.appliedFilter['Status']?.value && this.appliedFilter['Status'].value.id) {
            url = `${url}&status=${this.appliedFilter['Status'].value.id}`;
        }
        if (this.appliedFilter['Compaign']?.value && this.appliedFilter['Compaign'].value.id) {
            url = `${url}&campaign=${this.appliedFilter['Compaign'].value.id}`;
        }
        if (this.appliedFilter['Full name']?.value) {
            url = `${url}&name=${this.appliedFilter['Full name']?.value}`;
        }
        if (this.appliedFilter['Company name']?.value) {
            url = `${url}&company_name=${this.appliedFilter['Company name']?.value}`;
        }
     
        if (this.appliedFilter['Email']?.value) {
            url = `${url}&email=${this.appliedFilter['Email']?.value}`;
        }
        if (this.appliedFilter['Disposition']?.value && this.appliedFilter['Disposition'].value.id) {
            url = `${url}&disposition=${this.appliedFilter['Disposition'].value.id}`;
        }
        if (this.appliedFilter['Exclusive lead']?.value && this.appliedFilter['Exclusive lead'].value.id) {
            url = `${url}&exclusive_lead=${this.appliedFilter['Exclusive lead'].value.id}`;
        }
       
        if (this.appliedFilter['ISO']?.value && this.appliedFilter['ISO'].value.id) {
            url = `${url}&source=${this.appliedFilter['ISO'].value.id}`;
        }
        if (this.appliedFilter['ID']?.value) {
            url = `${url}&lead_id=${this.appliedFilter['ID']?.value}`;
        }
        if (this.appliedFilter['User']?.value && this.appliedFilter['User'].value.id) {
            url = `${url}&user_id =${this.appliedFilter['User'].value.id}`;
        }
        if (this.appliedFilter['Company']?.value && this.appliedFilter['Company'].value.id) {
            url = `${url}&company_id=${this.appliedFilter['Company'].value.id}`;
        }
        if (this.appliedFilter['Manager']?.value && this.appliedFilter['Manager'].value.id) {
            url = `${url}&search_by_manager=${this.appliedFilter['Manager'].value.id}`;
        }
        if (this.appliedFilter['Phone']?.value) {
            url = `${url}&phone=${this.appliedFilter['Phone']?.value}`;
        }
        if (this.appliedFilter['Search']?.value) {
            url = `${url}&search=${this.appliedFilter['Search']?.value}`;
        }

        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_LIST + url, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if (response.data && response.data.data) {
                    this.leadsList = response.data.data.map((e: any) => ({ ...e, selected: false }));
                    this.selectAll.nativeElement.checked = false;
                    this.totalRecords = response.data.total_records;
                } else {
                    this.leadsList = [];
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
     * @description on limit change
     * @param value 
     * @returns {void}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    onLimitChange(value: number): void {
        this.recordsPerPage = value;
        this.page = 1;
        this.getLeadsList();
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p 
     */
    onPageChange(p: number): void {
        this.page = p;
        this.getLeadsList();
    }

    getPaginationList() {
        let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
        for (let i = 0; i < data?.length; i++) {
            // console.log("njg", data[i].className)
            if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                data[i].style.background = this.color;
            } else {
                data[i].style.background = 'none';

            }
        }


    }
}
