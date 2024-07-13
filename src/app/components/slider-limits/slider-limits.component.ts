import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Mask } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import moment from 'moment';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';


@Component({
    selector: 'app-slider-limits',
    templateUrl: './slider-limits.component.html',
    styleUrls: ['./slider-limits.component.scss']
})
export class SliderLimitsComponent implements OnInit {

    addUserForm!: FormGroup;
    todayDate: string = '';
    passwordType: boolean = true;
    mask = Mask;
    userAlreadyExists: boolean = false;
    userExistvalue: number = 0;
    @ViewChild('dob',) DOB!: ElementRef;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    customerAlreadyExists: boolean = false;
    customerExistvalue: number = 0;
    customerEmail: string = '';
    customeruserRole: string = '';
    boolCondition: boolean = false;
    color!: string;
    userType: string = '';
    sliderDetails: any = {};
    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private el: ElementRef,
        private authService: AuthService,
        private router: Router

    ) { }

    ngOnInit(): void {
        let d = new Date();
        let day: any = d.getDate();
        if (day.toString().length < 2) {
            day = '0' + day;
        }
        // this.todayDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
        // this.todayDate = `${d.getMonth() + 1}-${day}-${d.getFullYear()}`
        let month:string|number = (d.getMonth() + 1);
        if (month.toString().length < 2) {
            month = '0' + month;
        }
        this.todayDate = `${month}-${day}-${d.getFullYear()}`
        this.initAddUserForm();;
        this.getSliderDetails();
        this.getUserDetails();

    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
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


    getDate(date: any, dateFormat: string) {
        return moment(date).format(`${dateFormat}`)
    }


    /**
     * @description get form controls
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    get f(): { [key: string]: AbstractControl } {
        return this.addUserForm.controls;
    }
    /**
     * @description initialize add compnay form
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
    initAddUserForm(): void {
        this.addUserForm = this.fb.group({
            max_funding_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
            max_withhold_percentage: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
            max_factor_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
            max_term_in_days: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
            max_daily_payment: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
        })
    }
    patchValues() {
        this.addUserForm.patchValue({
            max_funding_amount: this.sliderDetails.max_funding_amount,
            max_withhold_percentage: this.sliderDetails.max_withhold_percentage,
            max_factor_rate: this.sliderDetails.max_factor_rate,
            max_term_in_days: this.sliderDetails.max_term_in_days,
            max_daily_payment: this.sliderDetails.max_daily_payment,
        })
    }
    async getSliderDetails(): Promise<void> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_SLIDER_SETTINGS, 'slider', 'settings');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.sliderDetails = response.data;
                this.patchValues();

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
    async addUserSubmit(): Promise<void> {
        this.addUserForm.markAllAsTouched();
        if (this.addUserForm.valid) {
            try {
                this.commonService.showSpinner();

                let data = {
                    id: this.sliderDetails.id,
                    ...this.addUserForm.value,
                }
                const res$ = this.apiService.postReq(API_PATH.STORE_SLIDER_SETTINGS, data, 'slider', 'settings');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}`]);

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
    get currentDate() {
        return new Date();
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
}

