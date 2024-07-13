import { Component, ElementRef, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-participant-update',
    templateUrl: './participant-update.component.html',
    styleUrls: ['./participant-update.component.scss', '../../styles/dashboard.scss']
})
export class ParticipantUpdateComponent implements OnInit {
    uploadedDocsList: any[] = [];
    dateFormat: string = '';
    color: string = '';
    timeZone: string = '';
    userDetails: any = {};
    syndicateID: string = '';
    token: string = '';
    leadID: string = '';
    addUserForm!: FormGroup;
    companyType: string = '';
    constructor(private commonService: CommonService,
        private apiService: ApiService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private el: ElementRef) { }

    ngOnInit(): void {
        this.getUserDetails();
        this.initAddUserForm();
        let params = this.route.snapshot.params;
        let queryParams = this.route.snapshot.queryParams;
        if (params['id']) {
            this.syndicateID = params['id'];
            if (queryParams && queryParams['token'] && queryParams['lead_id']) {
                this.token = queryParams['token'];
                this.leadID = queryParams['lead_id'];
            }
            this.getParticipantsDocuments()

        }
    }


        /**
     * @description get logged in user details
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
         getUserDetails() {
            let ud = this.authService.getUserDetails();
    
            if (ud) {
                this.userDetails = ud;
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.color = ud.color;
            }
        }

        getDate(date: any) {
            let newDate = this.commonService.getExactDate(moment(date));
            return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
         }
        
    /**
     * @description get documents list
     */
    async getParticipantsDocuments() {
        try {
            this.commonService.showSpinner();
            let reqData: any = {
                lead_id: this.leadID,
                token: this.token,
                page: 1,
                records_per_page: 1000,
            }

            const res$ = this.apiService.postReq(API_PATH.VERIFY_PARTICIPANT_DOCUMENTS, reqData, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.uploadedDocsList = response.data.documents;
                // for (let i = 0; i < this.uploadedDocsList.length; i++) {
                //     if (this.uploadedDocsList[i].document_type != 'other') {
                //         this.docTypes = this.docTypes.filter(e => e.value != this.uploadedDocsList[i].document_type)
                //     }
                // }
            } else {
                this.uploadedDocsList = [];
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
    leadDetailsLink(url1: any) {
        const url = url1;
        window.open(url, '_blank')
    }

    async downloadFile(doc: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.VERIFY_SYNDICATE_DOWNLOAD, { file: doc.actual_name }, 'lead', 'list', 'arraybuffer');
            const response = await lastValueFrom(res$);
            const arrayBufferView = new Uint8Array(response);
            const file = new Blob([arrayBufferView], { type: doc.document_type });
            let url = window.URL.createObjectURL(file);
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
        //    a.download = doc.actual_name;
        if(this.companyType == 'funded'){
            a.download = doc.actual_name;
        }else{
            a.download = doc.download_path;
        }
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error)
        }
    }
    async onFinalStepSubmit() {
        this.addUserForm.markAllAsTouched();
        if (this.addUserForm.valid) {
             this.redirect();
            // try {
            //     this.commonService.showSpinner();
            //     let reqData: any = {
            //         syndicate_id: this.syndicateID,
            //         token: this.token
            //     }
            //     const res$ = this.apiService.postReq(API_PATH.SYNDICATE_EMAIL, reqData , '', '');
            //     let response = await lastValueFrom(res$);
            //     if (response && response.status_code == "200") {
            //         this.commonService.showSuccess(response.message);
            //         this.redirect();
            //     }
            //     this.commonService.hideSpinner();
            // } catch (error: any) {
            //     this.commonService.hideSpinner();
            //     if (error.error && error.error.message) {
            //         this.commonService.showError(error.error.message);
            //     } else {
            //         this.commonService.showError(error.message);
            //     }
            // }
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
    
    redirect() {
        this.router.navigate(['/syndicate-submitted/' + this.token], { queryParams:{type: 'participant'}});
    }
    initAddUserForm(): void {
        this.addUserForm = this.fb.group({
            participant_amount: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.digitsOnly),
            ]],
        })
    }

    /**
     * @description get lead detail form controls
     */
    get f(): { [key: string]: AbstractControl } {
        return this.addUserForm.controls;
    }



}
