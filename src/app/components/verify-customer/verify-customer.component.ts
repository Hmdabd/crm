import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { SETTINGS } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';
@Component({
    selector: 'app-verify-customer',
    templateUrl: './verify-customer.component.html',
    styleUrls: ['./verify-customer.component.scss']
})
export class VerifyCustomerComponent implements OnInit {
    token: string = '';
    color: string = '#fa5440';
    exactColor: string = '#fa5440';
    routePath: any = ''
    checkUserLogin:any;

    constructor(
        private route: ActivatedRoute,
        private commonService: CommonService,
        private apiService: ApiService,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.commonService.showSpinner();
        let params = this.route.snapshot.params;
        let queryParams = this.route.snapshot.queryParams;
        this.routePath = this.route.snapshot?.routeConfig?.path;
        if (queryParams && queryParams['c']) {
            this.exactColor = queryParams['c'];
        }
        if (params && params['token']) {
            this.token = params['token'];
            this.verifyToken();
        } else {
            if (queryParams && queryParams['token']) {
                this.token = queryParams['token'];
                this.verifyToken();
            }
            if (this.token == '') {
                this.commonService.showError('');
                this.router.navigate(['/login'])
            }

        }
    }

    async verifyToken() {
        try {
            let fromToken = 0;
            if (this.routePath == 'verify-customers') {
                fromToken = 1
            } else {
                fromToken = 0
            }
            const res$ = this.apiService.postReq(API_PATH.VERIFY_CUSTOMER, { token: this.token, color: this.exactColor, from_token: fromToken }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                //4th oct 2023
                this.checkUserLogin = response?.data?.login_check;
                if(this.checkUserLogin == 0){
                    this.router.navigate(['/login']);
                    const en = this.authService.encrypt(JSON.stringify(response?.data?.lead_id));
                    localStorage.setItem(SETTINGS.LEAD_ID, en);

                    // localStorage.setItem('leadID',response?.data?.lead_id);
                    }else if (this.checkUserLogin == 1){
                    // localStorage.setItem('leadID',response?.data?.lead_id);
                    const en = this.authService.encrypt(JSON.stringify(response?.data?.lead_id));
                    localStorage.setItem(SETTINGS.LEAD_ID, en);
                  this.router.navigate([`/${response?.data?.role?.toLowerCase()}`])  
                    }else{
                        this.saveUserDetails(response);

                    }
                //  console.log('datafromAPIResponse', this.checkUserLogin);
                 //4th end task
                // this.router.navigate(['']);
            } else {
                this.commonService.showError(response.message);
                this.commonService.hideSpinner();
                this.router.navigate(['/login'])
            }
             this.commonService.hideSpinner();

        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error?.error?.data?.exists == 0) {
                this.router.navigate(['/access-denied'])
                return
            }
            if (error?.error && error?.error?.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
            this.router.navigate(['/login'])
        }
    }

    /**
     * @description save user details after login
     * @param response
     * @author Shine Dezign Infonet Pvt. Ltd. 
     * @returns {void}
     */
    saveUserDetails(response: any): void {
        let userData = {}
        if (response.data.role == 'Customer') {
            userData = {
                role: response.data.role,
                role_name: response.data.role_name,
                name: response.data.name,
                crm_utilties: response.data.crm_utilties,
                date_format: response.data.date_format,
                time_zone: response.data.time_zone,
                permissions: response.data.permissions,
                access_token: this.token,
                logoImage: response.data.logo_image,
                color: response.data.primary_color,
                company_type: response.data.company_type,
            }
        } else {
            userData = {
                // role: response.data.role,
                // role_name: response.data.role_name,
                // name: response.data.name,
                // permissions: response.data.permissions,
                // date_format: response.data.date_format,
                // time_zone: response.data.time_zone,
                // logoImage: response.data.logo_image,
                // access_token: this.token,
                // color: response.data.primary_color,
                // crm_utilties: response.data.crm_utilties
                role: response.data.role,
                role_name: response.data.role_name,
                name: response.data.name,
                permissions: response.data.permissions,
                email: response.data.email,
                access_token: this.token,
                logoImage: response.data.logo_image,
                lead_email: '',
                email_configurations: response.data.email_configurations,
                twilio_configurations: response.data.twilio_configurations,
                date_format: response.data.date_format,
                time_zone: response.data.time_zone,
                color: response.data.primary_color,
                reports_decription: response.data.reports_decription,
                company_type: response.data.company_type,
                user_id: response.data.user_id,
                agent_logout_session: response.data.agent_logout_session,
                manage_card_permission: response.data.manage_card_permission,
                crm_utilties: response.data.crm_utilties
            }
        }
        const en = this.authService.encrypt(JSON.stringify(userData));
        localStorage.setItem(SETTINGS.USER_DETAILS, en);
        localStorage.setItem(SETTINGS.TOKEN_KEY, response.data.token);
        // this.routePath == 'verify-customers' &&
        //4th oct
        // console.log(response,'response');
        //end
        if (response.data.role == 'Customer') {
            this.router.navigate([`/customer/lead-update/${response.data.lead_id}`], { queryParams: { sendApp: 'true' } })
        } else {
            
             this.router.navigate([`/${response?.data?.role?.toLowerCase()}/lead-detail/${response.data.lead_id}`])
            // this.router.navigate([`/customer/lead-detail/${response.data.lead_id}`])
        }

    }
    // loader color
    ngDoCheck(): void {
        let data1 = document.getElementsByClassName('ngx-progress-bar ngx-progress-bar-ltr')[0] as HTMLInputElement
        // data1.style.color=`${this.color}!important`;
        data1.setAttribute('style', `color:${this.color}!important`)
        let data2 = document.getElementsByClassName('ngx-foreground-spinner center-center')[0] as HTMLInputElement
        data2.setAttribute('style', `color:${this.color}!important`)

    }
}
