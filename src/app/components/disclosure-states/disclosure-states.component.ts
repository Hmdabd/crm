import { ThisReceiver } from '@angular/compiler';
import { Component, ElementRef, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-disclosure-states',
    templateUrl: './disclosure-states.component.html',
    styleUrls: ['./disclosure-states.component.scss']
})
export class DisclosureStatesComponent implements OnInit {
    statesList: Array<any> = [];
    disclosureStatesForm!: FormGroup;
    background!: { background: string; };
    colorSubs!: Subscription;
    hasMoreUsers: boolean = false;
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    userListPage: number = 1;
    diclosureList: Array<any> = [];
    color: string = '';
    canDeleteDisclosure: boolean = false;
    canAddDisclosure: boolean = false;
    timeZone: string = '';
    dateFormat: string = '';
    style!: { fill: string; };


    constructor(private commonService: CommonService,
        private apiService: ApiService,
        private authService: AuthService,
        private el: ElementRef,
        private fb: FormBuilder,
        private router: Router,) { }

    ngOnInit(): void {
        this.getUserDetails();
        this.initAddDisclosureForm();
        this.getDisclosureList();
        this.getStates();
        this.getPaginationLIst();
        this.canDeleteDisclosure = this.authService.hasPermission('disclosure-state-delete');
        this.canAddDisclosure = this.authService.hasPermission('disclosure-state-create');
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.getColorOnUpdate();
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.color =ud?.color;
                this.style = { fill: ud?.color };
                // this.stroke={stroke:ud?.color};
                this.background = { background: ud?.color };

            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    ngDoCheck() {
        // this.getUserDetails();
        // this.getColorOnUpdate();

        this.getPaginationLIst();
        this.getDateColor();
    }
    getDate(date: any) {
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }


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
    getPaginationLIst() {

        let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
        for (let i = 0; i < data?.length; i++) {
            if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                data[i].style.background = this.color;
            } else {
                data[i].style.background = 'none';

            }
            // data[i]
        }

    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
  
    onPageChange(p: number): void {
        this.userListPage = p;
        this.getDisclosureList();
        // this.getLeadDocuments();
    }

   

    /**
     * @description initialize add compnay form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    initAddDisclosureForm(): void {
        this.disclosureStatesForm = this.fb.group({
            state_id: ['', [Validators.required]],
            // country_id: ['', [Validators.required]],
            // fax: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            // zip_code: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            // time_zone_id: [''],
            // date_format_id: [''],
            // sip_extension: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
            // sip_password: ['', [Validators.pattern(Custom_Regex.spaces)]],
            // auto_commission: [false],
        })
    }
    get f(): { [key: string]: AbstractControl } {
        return this.disclosureStatesForm.controls;
    }

    async getDisclosureList(): Promise<any> {
        try {
            let url = `?&page_limit=${this.usersListLimit}&page=${this.userListPage}`;
          
            this.commonService.showSpinner();
            // 'agent', 'list'
            const res$ = this.apiService.getReq(API_PATH.GET_DISCLOSURE_LIST + url, 'disclosure', 'state-list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                this.totalUsersCount = response.data.total;
                this.diclosureList = response.data.data;
            } else {
                this.diclosureList = [];
                this.hasMoreUsers = false;
                this.userListPage = 1;
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

    async getStates() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.DISCLOSURE_STATES, 'lead', 'view');
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

    /**
     * @description on add company submit
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async addDiscloserSubmit(): Promise<void> {
        this.disclosureStatesForm.markAllAsTouched();
        if (this.disclosureStatesForm.valid) {
            try {
                this.commonService.showSpinner();

                let data = {
                    ...this.disclosureStatesForm.value,
                }
                const res$ = this.apiService.postReq(API_PATH.DISCLOSURE_STATE_CREATE, data, 'disclosure', 'state-create');
                let response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.disclosureStatesForm.reset();
                    this.getStates();
                    this.getDisclosureList();
                    // if (response.data.already_exist == 1) {
                    //     this.userAlreadyExists = true
                    //     this.openrestoreUserpopup(response.message);

                    // } else {
                    //     this.commonService.showSuccess(response.message);
                    //     this.router.navigate([`/${this.userBaseRoute}/agent`]);
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
    // async getDisclosureList(): Promise<any> {
    //     try {
    //         // &lead_id=${this.leadID}&status=Active
    //         let url = `?&page_limit=${this.usersListLimit}&page=${this.userListPage}`;

    //         this.commonService.showSpinner();
    //         const res$ = this.apiService.getReq(API_PATH.GET_DISCLOSURE_LIST + url, 'disclosure', 'state-list');
    //         let response = await lastValueFrom(res$);
    //         if (response && response.data) {
    //             this.hasMoreUsers = response.data.hasMorePages;
    //             if (this.userListPage == 1) {
    //                 this.totalUsersCount = response.data.total;
    //                 this.diclosureList = response.data;

    //             } else {
    //                 this.diclosureList = [];

    //             }
    //             // this.participantSpecList = response.data.data.map((e: any) => ({ ...e, selected: false }));
    //             // this.participantSpecList.forEach((object) => { object.toggle = false });

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

  
   
    async deleteDoc(Id: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DISCLOSURE_DELETE, { id: Id }, 'disclosure', 'state-delete');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.diclosureList = this.diclosureList.filter(e => e.id !== Id);
                this.getDisclosureList();
                this.getStates();
                

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

   
    redirect(){
        this.router.navigate([`/${this.userBaseRoute}`]);
    }
   
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }


}
