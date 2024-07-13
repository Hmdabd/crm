import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Roles, Mask } from '@constants/constants';
import { NgbAccordion, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import moment from 'moment';

@Component({
    selector: 'app-create-contract-hub-sign-update',
    templateUrl: './create-contract-hub-sign-update.component.html',
    styleUrls: ['./create-contract-hub-sign-update.component.scss']
})
export class CreateContractHubSignUpdateComponent implements OnInit {
    modal!: NgbModalRef;
    role = Roles;
    tabView: boolean = true;
    userDetails: any = {};
    leadSouceForm!: FormGroup;
    token: string = '';
    tabActive = {
        id: 'LeadDetails',
        number: 1
    }
    opentab: any;
    currentStep = 1;
    mask = Mask;
    @ViewChild('acc', { static: false }) accordion!: NgbAccordion;
    submitterTabIndex: number = 0;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    userRole: string = ''
    passwordType: boolean = true;
    dateFormat: string = '';
    customerSign: string = '';
    timeZone: string = '';
    companyType: string = '';
    packageOpenedDate: string = '';
    signatureAdoptedDate: string = '';
    documentPath: string = '';
    documentName: string = '';
    documentType: string = '';
    documentActualName: string = '';
    documentDownloadPath: string = '';
    bankDataValue:any={};

    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private authService: AuthService,
        private loc: Location,
        private el: ElementRef,
        private modalService: NgbModal,
        private route: ActivatedRoute,

    ) { }

    ngOnInit(): void {
        let queryParams = this.route.snapshot.queryParams;
        if (queryParams) {
            if (queryParams['token']) {
                this.token = queryParams['token'];
            }
            if (queryParams['document_name']) {
                this.documentName = queryParams['document_name'];
            }
            if (queryParams['path']) {
                this.documentPath = queryParams['path'];
            }
            if (queryParams['document_type']) {
                this.documentType = queryParams['document_type'];
            }
            if (queryParams['actual_name']) {
                this.documentActualName = queryParams['actual_name'];
            }
            if (queryParams['download_path']) {
                this.documentDownloadPath = queryParams['download_path'];
            }


        }
        this.initcontractForm();
        this.getUserDetails();
        this.getContractHubInfo();
        this.commonService.hideSpinner();
    }

    // patchValues() {
    //     // this.getStates(this.leadSourceDetails.country_id, this.leadSourceDetails.state_id)
    //     this.leadSouceForm.patchValue({
    //         name: this.leadSourceDetails.name,
    //         first_name: this.leadSourceDetails.first_name,
    //         last_name: this.leadSourceDetails.last_name,
    //         time_zone_id: this.leadSourceDetails.time_zone_id,
    //         email: this.leadSourceDetails.email,
    //         phone_number: this.leadSourceDetails.phone_number,
    //         role: this.leadSourceDetails.role,
    //         company_name: this.leadSourceDetails.company_name,
    //         address: this.leadSourceDetails.address,
    //         other_address: this.leadSourceDetails.other_address,
    //         zip_code: this.leadSourceDetails.zip_code,
    //         city: this.leadSourceDetails.city,
    //         country_id: this.leadSourceDetails.country_id,
    //         entity_type_id: this.leadSourceDetails.entity_type_id,
    //         // state_id: this.leadSourceDetails.state_id,
    //         ein: this.leadSourceDetails.ein,

    //     })
    //     this.previewData.path = this.leadSourceDetails.path;
    //     this.previewData.document_name = this.leadSourceDetails.document_name;
    //     this.previewData.document_type = this.leadSourceDetails.document_type;
    //     this.previewData.document = this.leadSourceDetails.document;
    //     this.previewData.actual_name  = this.leadSourceDetails.actual_name;
    //     this.previewData.download_path  = this.leadSourceDetails.download_path;
    //     setTimeout(() => {
    //         this.leadSouceForm.patchValue({
    //             state_id: this.leadSourceDetails.state_id
    //         })
    //     })
    //     this.convertImageToBase64(this.leadSourceDetails.sign);

    // }


    // async getLeadSourceDetails(): Promise<void> {
    //     try {
    //         let url = `?id=${this.leadSourceId}&token=${this.token}`;
    //         this.commonService.showSpinner();
    //         // let data = {
    //         //     id: this.leadSourceId
    //         // }
    //         const res$ = this.apiService.getReq(API_PATH.VERIFY_LEAD_SOURCE_VIEW + url, '', '');
    //         let response = await lastValueFrom(res$);
    //         if (response && response.data) {
    //             this.leadSourceDetails = response.data;
    //             await this.getStates(this.leadSourceDetails?.country_id, '');
    //             this.patchValues();

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

    // convertImageToBase64(imgUrl: any) {
    //     const image = new Image();
    //     image.crossOrigin = 'anonymous';
    //     image.onload = () => {
    //         const canvas = document.createElement('canvas');
    //         const ctx = canvas.getContext('2d');
    //         canvas.height = image.naturalHeight;
    //         canvas.width = image.naturalWidth;
    //         ctx?.drawImage(image, 0, 0);
    //         const dataUrl = canvas.toDataURL();
    //         this.customerSign = dataUrl;
    //     }
    //     image.src = imgUrl;
    // }

    goBack() {
        this.loc.back();
    }

    validateTabChange(number: number, id: string) {
        try {
            if (number > this.submitterTabIndex + 1) return;

            this.tabActive = {
                id: id,
                number: number
            }
        } catch (error: any) {
            console.log(error.message);
        }
    }

    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.userRole = ud.role;
            this.userDetails = ud;
            this.dateFormat = ud.date_format;
            this.timeZone = ud.time_zone;
            this.companyType = ud.company_type;
            this.getColorOnUpdate();
            this.style = { fill: ud?.color };
            this.color = ud?.color;
            this.background = { background: ud?.color };
        }
    }

    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }

    initcontractForm() {
        this.leadSouceForm = this.fb.group({
            name_of_bank: ['', [Validators.pattern(Custom_Regex.spaces)]],
            bank_portal_website: ['', [Validators.pattern(Custom_Regex.website)
            ]],
            username: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly)
            ]],
            password: ['', [Validators.pattern(Custom_Regex.spaces)]],
            any_other_information: ['', [Validators.pattern(Custom_Regex.spaces)]],
            add_security_question_answers: this.fb.array([]),
            add_business: this.fb.array([]),
        });
    }
    get securityQuestionAwswersArray() {
        return this.leadSouceForm.get('add_security_question_answers') as FormArray
    }
    addsecurityForm(value: any, status: any) {
        return this.fb.group({
            security_question_answer: [value?.security_question_answer ? value?.security_question_answer : '', [Validators.pattern(Custom_Regex.spaces)]],
        })
    }
    addSecurity(value: any) {
        return this.securityQuestionAwswersArray.push(this.addsecurityForm({}, value))
    }
    removeSecurity(i: number) {
        this.securityQuestionAwswersArray.removeAt(i);
    }

    get additionalBussinessArray() {
        return this.leadSouceForm.get('add_business') as FormArray
    }
    additionalBussinessForm(value: any, status: any) {
        return this.fb.group({
            business_name: [value?.business_name ? value?.business_name : '', [Validators.pattern(Custom_Regex.spaces)]],
            contact_name: [value?.contact_name ? value?.contact_name : '', [Validators.pattern(Custom_Regex.spaces)]],
            amount: [value?.amount ? value?.amount : '', [Validators.pattern(Custom_Regex.amount)]],
            phone_number: [value?.phone_number ? value?.phone_number : '', [Validators.pattern(Custom_Regex.digitsOnly)]],
            owe_money: [value?.owe_money ? value?.owe_money : "No"],
        })
    }
    addBussiness(value: any) {
        return this.additionalBussinessArray.push(this.additionalBussinessForm({}, value))
    }
    removeBussiness(i: number) {
        this.additionalBussinessArray.removeAt(i);
    }


    /**
     * @description get lead detail form controls
     */
    get f(): { [key: string]: AbstractControl } {
        return this.leadSouceForm.controls;
    }



    /**
     * @description on next click in lead details form
     */
    async onUpdateLeadSourceSubmit() {
        this.leadSouceForm.markAllAsTouched();
        if (this.leadSouceForm.valid) {
            try {
                this.commonService.showSpinner();

                let data = {
                    ...this.leadSouceForm.value,
                    token: this.token,

                }
                const res$ = this.apiService.postReq(API_PATH.CREATE_CONTRACT_HUB_SIGN, data, '', '');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.documentPath = response.data.path;
                    this.documentDownloadPath = response.data.download_path;
                    this.documentName = response.data.document_name;
                    this.documentType = response.data.document_type;
                    this.documentActualName = response.data.actual_name;
                    // this.tabActive = {
                    //     id: 'OfficerInfo',
                    //     number: 2
                    // }
                    this.redirect();
                    this.changeDetectorRef.detectChanges();
                    // this.packageOpenedDate = new Date().toJSON("yyyy/MM/dd HH:mm");
                    // this.signatureAdoptedDate = new Date().toJSON("yyyy/MM/dd HH:mm");
                    if (this.submitterTabIndex < 1) {
                        this.submitterTabIndex = 1;
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

    }

    focusInvalidField() {
        const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
            ".form-group .ng-invalid"
        );
        if (firstInvalidControl)
            firstInvalidControl.focus();
    }

    openAccordianTab(tabID: string): void {
        this.accordion.expand(tabID);
        this.changeDetectorRef.detectChanges();
    }


    closeAccordianTab(tabID: string): void {
        this.accordion.collapse(tabID);
    }

    async onOfficerInfoSubmit() {
        if (!this.customerSign) {
            this.commonService.showError('Please add signature before submission');
            return;
        }
        try {
            this.commonService.showSpinner();
            let registerDate = new Date().toJSON("yyyy/MM/dd HH:mm");
            const formData: FormData = new FormData();
            formData.append('token', this.token);
            formData.append('sign', this.customerSign);
            formData.append('package_signed_at', this.getDate(registerDate));
            formData.append('package_opened_at', this.getDate(this.packageOpenedDate));
            formData.append('signature_adopted_at', this.getDate(this.signatureAdoptedDate));

            const res$ = this.apiService.postReq(API_PATH.HUB_SIGN_UPDATE, formData, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.step2Tab()
              
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
    closeAlltabs() {
        this.accordion.collapseAll();
    }

    redirect() {
        this.router.navigate(['/thanx-message'], { queryParams: { type: 'hub_sign' } });
    }
    openModel(content: any) {
        try {
            this.modal = this.modalService.open(content, { backdrop: 'static' });
            this.packageOpenedDate = new Date().toJSON("yyyy/MM/dd HH:mm");
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    closeModal() {
        this.signatureAdoptedDate = new Date().toJSON("yyyy/MM/dd HH:mm");
        this.modal.close();
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    toggle(ID: string) {
        setTimeout(() => this.accordion.toggle(ID), 0);
    }
    leadDetailsLink(url1: any) {
        const url = url1;
        window.open(url, '_blank')
    }

    getDate(date: any) {
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }

    step2Tab() {
        this.leadSouceForm.markAllAsTouched();
        if (!this.customerSign) {
            this.commonService.showError('Please add signature before submission');
            return;
        }
        if (this.leadSouceForm.valid) {
            this.tabActive = {
                id: 'OfficerInfo',
                number: 2
            }
        }

    }


    // new code
    async downloadFile() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.HUB_SIGN_DOWNLOAD, { file: this.documentActualName }, '', '', 'arraybuffer');
            const response = await lastValueFrom(res$);
            const arrayBufferView = new Uint8Array(response);
            const file = new Blob([arrayBufferView], { type: this.documentType });
            let url = window.URL.createObjectURL(file);
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
            a.download = this.documentDownloadPath;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
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
    openFile(value: any) {
        var a = document.createElement('a');
        a.target = "_blank";
        a.href = value;
        a.click();

    }
    get getUserRole() {
        return this.authService.getUserRole().toLowerCase();
    }
    async getContractHubInfo() {
        try {
            this.commonService.showSpinner();
           let data = {
            token:this.token
           }
            const res$ = this.apiService.postReq(API_PATH.GET_CONTRACT_HUB_SIGN_VALUE, data, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data && response.status_code == "200") {
                this.bankDataValue = response.data;
                if(this.bankDataValue.add_business?.length){
                    for(let i = 0;i<this.bankDataValue.add_business.length;i++){
                        this.additionalBussinessArray.push(this.additionalBussinessForm(this.bankDataValue.add_business[i], false))
                    }     
                }else{
                    this.addBussiness(true);
                    this.addBussiness(true);
                    this.addBussiness(true);
                    this.addBussiness(true);
                }
                this.patchValue();

              
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
    patchValue(){
        this.leadSouceForm.patchValue({
          name_of_bank:this.bankDataValue?.name_of_bank,
          bank_portal_website:this.bankDataValue?.bank_portal_website,
          username:this.bankDataValue?.username,
          password:this.bankDataValue?.password ,
          any_other_information:this.bankDataValue?.any_other_information 
        })
        if(this.bankDataValue.add_security_question_answers?.length){
            for(let i = 0;i<this.bankDataValue.add_security_question_answers.length;i++){
                this.securityQuestionAwswersArray.push(this.addsecurityForm(this.bankDataValue.add_security_question_answers[i], false))
            }     
        }else{
            this.addSecurity(true);
        
      
     }

}
}




