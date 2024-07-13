import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { SETTINGS } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-verify-hub-sign',
    templateUrl: './verify-hub-sign.component.html',
    styleUrls: ['./verify-hub-sign.component.scss']
})
export class VerifyHubSignComponent implements OnInit {
    token: string = '';
    color: string = '#fa5440';
    exactColor: string = '#fa5440';

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
        if (queryParams && queryParams['c']) {
            this.exactColor = queryParams['c'];
        }
        if (params && params['token']) {
            this.token = params['token'];
            this.verifyToken();
        } else {
            this.commonService.showError('');
            this.router.navigate(['/login'])
        }
    }

    async verifyToken() {
        try {
            const res$ = this.apiService.postReq(API_PATH.VERIFY_HUB_SIGN, { token: this.token, color: this.exactColor }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.saveUserDetails(response);
            } else {
                this.commonService.showError(response.message);
                this.commonService.hideSpinner();
                this.router.navigate(['/login'])
            }
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
            this.router.navigate(['/login'])
        }
    }

    saveUserDetails(response: any): void {
        const userData = {
            role: response.data.role,
            role_name: response.data.role_name,
            // name: response.data.name,
            //permissions: response.data.permissions,
            date_format: response.data.date_format,
            time_zone: response.data.time_zone,
            logoImage: response.data.logo_image,
            access_token: this.token,
            color: response.data.primary_color,
            // crm_utilties: response.data.crm_utilties
        }
        const en = this.authService.encrypt(JSON.stringify(userData));
        localStorage.setItem(SETTINGS.USER_DETAILS, en);
        localStorage.setItem(SETTINGS.TOKEN_KEY, response.data.token);
        if (response.data.type == 'contract') {
            this.router.navigate([`/create-contract-hub-sign`], { queryParams: { token: response.data.token, document_name: response.data.document_name, path: response.data.path, document_type: response.data.document_type, actual_name: response.data.actual_name, download_path: response.data.download_path } })
        } else {
            this.router.navigate([`/hub-sign-update`], { queryParams: { token: response.data.token, document_name: response.data.document_name, path: response.data.path, document_type: response.data.document_type, actual_name: response.data.actual_name, download_path: response.data.download_path,isSigned:response.data?.is_signed } })
        }

    }
    ngDoCheck(): void {
        let data1 = document.getElementsByClassName('ngx-progress-bar ngx-progress-bar-ltr')[0] as HTMLInputElement
        data1.setAttribute('style', `color:${this.color}!important`)
        let data2 = document.getElementsByClassName('ngx-foreground-spinner center-center')[0] as HTMLInputElement
        data2.setAttribute('style', `color:${this.color}!important`)

    }
}
