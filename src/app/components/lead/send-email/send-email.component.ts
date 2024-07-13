import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { ApiService } from '@services/api.service';
import { API_PATH } from '@constants/api-end-points';
import { CommonService } from '@services/common.service';
import { EMPTY, lastValueFrom, map, Subscription } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CKEditorComponent } from 'ng2-ckeditor';
import { AuthService } from '@services/auth.service';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Custom_Regex, SETTINGS } from '@constants/constants';
import { AngularEditorConfig, AngularEditorComponent } from '@kolkov/angular-editor';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-send-email',
    templateUrl: './send-email.component.html',
    styleUrls: ['./send-email.component.scss']
})
export class SendEmailComponent implements OnInit {
    modal!: NgbModalRef;
    emailTemplatesList: Array<any> = [];
    selectedTemplate: any;
    emailTemplateHTML: any;
    emailSubject: string = '';
    emailTemplateForm!: FormGroup;
    template_name: any;
    templateId: string = '';
    subject: any;
    template: any;
    name = 'ng2-ckeditor';
    ckeConfig: any = CKEDITOR.config;
    mycontent: string | undefined;
    log: string = '';
    @ViewChild("myckeditor")
    ckeditor!: CKEditorComponent;
    firstTemplateKey: any;
    canUpdateTemplate: boolean = false;
    canAddTemplate: boolean = false;
    showDeleteButton: boolean = false;
    emailTemplateId: string = '';
    canDeleteTemplate: boolean = false;
    personilizedVariables: any = [];
    editorRef!: any;
    editMode: boolean = false;
    emailTemplateType: string = '';
    duplicateMode: boolean = false;
    leadStatusList: Array<any> = [];
    templateType: Array<any> = [];
    fromOptions: Array<any> = [];
    rolesList: Array<any> = [];
    loading = false;
    editorConfig: AngularEditorConfig = {
        height: '600px',
        editable: true,
        sanitize: false,
        uploadUrl: 'company/image-upload',
        upload: (file) => {
            const formData = new FormData();
            formData.append("image", file);
            if (SETTINGS.ALLOWED_FILES.includes(file.type)) {

                this.commonService.showSpinner();
                return this.apiService.postReq(API_PATH.UPLOAD_EMAIL_TEMPLATE_IMAGE, formData, 'documents', 'upload').pipe(
                    map((x: any) => {
                        x.body = { imageUrl: x.data.imageUrl };
                        this.commonService.hideSpinner();
                        return x;
                    })
                )

            }

            else {
                this.commonService.showError('Invalid file type. Allowed file type are - gif|jpeg|png|txt|doc|docx|xlsx|xls|pdf|wav|mp3 ');
                return EMPTY;
            }
        },
        uploadWithCredentials: false,
        toolbarHiddenButtons: [
            [],
            [
                // 'insertImage',
                'insertVideo'
            ]
        ]
    }
    @ViewChild('personizedVars') personizedVars!: ElementRef;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    @ViewChild('placeholdersVars') placeholdersVars!: ElementRef;
    crmUtilitiesType: Array<any> = [];
    alreadyExistsCrmUtility: number = 0;
    color: string = ''
    companyType: string = '';
    companyDocuments: Array<any> = [];
    page: number = 1;
    limit: number = 2000;
    crmUtilityName: string = '';
    showCustomEmail: boolean = false;
    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public fb: FormBuilder,
        private authService: AuthService,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.getUserDetails();
        this.getEmailTemplateOptions();
        this.initEmailTemplateForm();
        this.getPersonilzedVars();
        this.getRolesOptions();
        this.getCompanyDocsList();
        this.canAddTemplate = this.authService.hasPermission('email-template-add');
        this.canUpdateTemplate = this.authService.hasPermission('email-template-update');
        this.canDeleteTemplate = this.authService.hasPermission('email-template-delete');
        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        if (params['id']) {
            this.templateId = params['id'];
            this.getLeadOptions();
            //   this.getEmailTemplateData();

        }
        if (query['mode'] && query['mode'] === 'duplicate') {
            this.duplicateMode = true;
        }



    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                this.color = ud?.color;
                this.companyType = ud.company_type
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




    /**
     * @description initialize email template form
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    initEmailTemplateForm() {
        this.emailTemplateForm = this.fb.group({
            template_name: ['', [Validators.required]],

            template_type: ['', [Validators.required,]],
            send_application_attachment: [1],
            crm_utility: [''],
            // is_default: [0, [Validators.required,]],
            // lead_status:  [''],
            status: [1],
            send_bcc: [0],
            from_option: ['', [Validators.required]],
            to_option: [''],
            bcc_option: [''],
            keep_renewal_user: [0],
            subject: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                // Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            template: ['', [Validators.required]],
            attachments: [''],
            custom_email: []
        });
        if(this.crmUtilityName =='Reset Password'){
            this.emailTemplateForm.get('to_option')?.clearValidators();
            this.emailTemplateForm.get('to_option')?.updateValueAndValidity();
            }else{
                this.emailTemplateForm.get('to_option')?.setValidators([Validators.required])
                this.emailTemplateForm.get('to_option')?.updateValueAndValidity();
            }
    }
    get f(): { [key: string]: AbstractControl } {
        return this.emailTemplateForm.controls;
    }


    /**
     * @description formcontrols getters
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { [key: string]: AbstractControl }
     */



    async getLeadOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.templateType = response.data.template_type;
                this.leadStatusList = response.data.status;
                this.fromOptions = response.data.from_options;
                this.crmUtilitiesType = response.data.crm_utilities;
                this.getEmailTemplateData()
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
    async emailTemplateFormSubmit(): Promise<void> {
        this.emailTemplateForm.markAllAsTouched();
        this.custoEmailValidators();
        if (this.emailTemplateForm.valid) {
            let url = '';
            if (this.duplicateMode) {
                url = API_PATH.ADD_EMAIL_TEMPLATE
            } else {
                url = API_PATH.SAVE_EMAIL_TEMPLATE
            }
            try {
                let data = {
                    ...this.emailTemplateForm.value,
                    template_id: this.templateId,
                    type: this.emailTemplateType,
                    already_exist: this.alreadyExistsCrmUtility,
                    attachments: this.crmUtilityName == 'ISO' || this.crmUtilityName == 'Syndicate' ? this.emailTemplateForm.value.attachments.split() : this.emailTemplateForm.value.attachments,
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(url, data, 'email-template', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/email-template-list`]);
                }
                this.commonService.hideSpinner();
            } catch (error: any) {
                this.commonService.hideSpinner();

                if (error?.error?.data.already_exist == 1) {
                    Swal.fire({
                        title: error?.error?.message,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'OK',
                        confirmButtonColor: this.color,
                    }).then((result) => {
                        if (result.value) {
                            this.alreadyExistsCrmUtility = 1;
                            this.emailTemplateFormSubmit();
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            Swal.close()
                        }
                    })
                } else {
                    if (error.error && error.error.message) {
                        this.commonService.showError(error.error.message);
                    } else {
                        this.commonService.showError(error.message);

                    }
                }
                // if (error.error && error.error.message) {
                //     this.commonService.showError(error.error.message);
                // } else {
                //     this.commonService.showError(error.message);
                // }
            }

        }

    }
    async getRolesOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.ROLES_EMAIL_LIST, 'user', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.rolesList = response.data;
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
    opensendEmailRemovepopup() {
        Swal.fire({
            title: 'Are you sure want to delete?',
            text: 'You will not be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            confirmButtonColor: this.color,
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                this.deleteEmail();

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
            }
        })

    }
    getCapitalizeName(name: any) {
        let actualName = name.replace(/[{} $]/g, "");
        actualName = actualName.replace(/[ _ ]/g, " ")
        return this.transform(actualName)
    }
    async deleteEmail() {
        try {
            let data = {
                template_id: this.emailTemplateId
            }
            this.commonService.showSpinner();
            const res$ = await this.apiService.postReq(API_PATH.EMAIL_TEMPLATES_DELETE, data, 'email-template', 'delete')
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                this.emailTemplatesList = this.emailTemplatesList.filter(el => !this.emailTemplateId.includes(el.id));
                if (this.emailTemplatesList[0]) {
                    this.firstTemplateKey = this.emailTemplatesList[0].key
                }
                Swal.close();

            }
            this.commonService.hideSpinner();


        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showError(error.error.message);
        }
    }


    async getEmailTemplateOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_ALL_EMAIL_TEMPLATE_NAMES, 'email-template', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.emailTemplatesList = response.data;

                if (response.data[0]) {
                    this.firstTemplateKey = response.data[0].key
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

    // async getEmailTemplateData(template: any) {
    //     if (template) {
    //         try {
    //             this.commonService.showSpinner();
    //             const res$ = this.apiService.postReq(API_PATH.GET_EMAIL_TEMPLATE_HTML, { 'template_name': template }, 'email-template', 'view');
    //             let response = await lastValueFrom(res$);
    //             if (response && response.data) {
    //                 this.emailTemplateForm.patchValue({
    //                     subject: response.data.subject,
    //                     template: response.data.template
    //                 });
    //                 if (response.data.type == 1) {
    //                     this.emailTemplateId = response.data.id
    //                     this.showDeleteButton = true
    //                 } else {
    //                     this.showDeleteButton = false
    //                 }
    //             }
    //             this.commonService.hideSpinner();
    //         } catch (error: any) {
    //             this.commonService.hideSpinner();
    //             if (error.error && error.error.message) {
    //                 this.commonService.showError(error.error.message);
    //             } else {
    //                 this.commonService.showError(error.message);
    //             }
    //         }
    //     }

    // }
    async getEmailTemplateData() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.GET_EMAIL_TEMPLATE_HTML, { 'template_id': this.templateId }, 'email-template', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                if (this.duplicateMode) {
                    this.emailTemplateForm.patchValue({
                        template: response.data.template,
                        subject: response.data.subject,
                        template_name: response.data.template_name + '_new',
                        template_type: response.data.template_type,
                        send_application_attachment: response.data.send_application_attachment,
                        // is_default: response.data.is_default,
                        // lead_status: response.data.lead_status,
                        status: response.data.status,
                        from_option: response.data.from_option,
                        send_bcc: response.data.send_bcc,
                        to_option: response.data.to_option,
                        keep_renewal_user: response.data.keep_renewal_user,
                        bcc_option: response.data.bcc_option,
                        crm_utility: '',
                        attachments: '',
                        custom_email: response.data.custom_email,
                    });
                } else {
                    let obj = this.crmUtilitiesType.filter(e => e.id == response.data.crm_utility);
                    if (obj.length) {
                        this.crmUtilityName = obj[0].name;
                    }
                    this.emailTemplateForm.patchValue({
                        subject: response.data.subject,
                        template: response.data.template,
                        template_type: response.data.template_type,
                        template_name: response.data.template_name,
                        send_application_attachment: response.data.send_application_attachment,
                        // is_default: response.data.is_default,
                        // lead_status: response.data.lead_status,
                        status: response.data.status,
                        to_option: response.data.to_option,
                        custom_email: response.data.custom_email,
                        send_bcc: response.data.send_bcc,
                        from_option: response.data.from_option,
                        bcc_option: response.data.bcc_option,
                        keep_renewal_user: response.data.keep_renewal_user,
                        crm_utility: response.data.crm_utility,
                        attachments: this.crmUtilityName == 'ISO' || this.crmUtilityName == 'Syndicate' ? response.data.attachments.toString() : response.data.attachments,
                    });
                }
                this.toOptionValue()

                this.emailTemplateType = response.data.type


                if (response.data.type == 1) {
                    this.emailTemplateId = response.data.id
                    this.showDeleteButton = true
                } else {
                    this.showDeleteButton = false
                }
                // condtion based on reset
                // const resetPasswordID = 'kbm7YDeX6klCq~OYZFrIEg==';
                // if(this.emailTemplateForm.value.crm_utility.includes(resetPasswordID))
                if(this.crmUtilityName =='Reset Password'){
                    this.emailTemplateForm.get('to_option')?.clearValidators();
                    this.emailTemplateForm.get('to_option')?.updateValueAndValidity();
                    }else{
                        this.emailTemplateForm.get('to_option')?.setValidators([Validators.required])
                        this.emailTemplateForm.get('to_option')?.updateValueAndValidity();
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

    async openPeronisedForm(e: AngularEditorComponent) {
        try {
            this.editorRef = e;
            if (!Object.keys(this.personilizedVariables).length) {
                this.getPersonilzedVars();
            }
            this.modal = this.modalService.open(this.personizedVars);

        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    async getPersonilzedVars() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.PERSONILIZED_VARIABLES, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.personilizedVariables = response.data;
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    closeModal() {
        if (this.modal)
            this.modal.close();
    }

    transform(value: string): string {
        let first = value.substr(0, 1).toUpperCase();
        return first + value.substr(1);
    }

    onTokenSelect(e: any) {
        if (this.editorRef) {
            // let actualName = e.target.value.replace(/[{} $]/g, "");
            // actualName = actualName.replace(/[ _ ]/g, " ")
            // this.editorRef.executeCommand('insertText',`${this.transform(actualName)}: ${e.target.value}`);
            if (this.editorRef) {
                let actualName = e.replace(/[{} $]/g, "");
                actualName = actualName.replace(/[ _ ]/g, " ")
                this.editorRef.focus();
                this.editorRef.editorService.restoreSelection();
                if (this.companyType == 'broker') {
                    this.editorRef.executeCommand('insertText', `${e}`);
                } else {
                    this.editorRef.executeCommand('insertText', `${this.transform(actualName)}: ${e}`);
                }


            }
            // this.editorRef.executeCommand('insertText',`${e.target.value}`);
        }
        this.closeModal()
    }

    async sendTestEmail(): Promise<void> {
        this.emailTemplateForm.markAllAsTouched();
        this.custoEmailValidators();
        if (this.emailTemplateForm.valid) {
            try {
                let data = {
                    // ...this.emailTemplateForm.value,
                    // template_subject:this.emailTemplateForm.get('subject')?.value,
                    template_id: this.templateId,
                    template_name: this.emailTemplateForm.value.template_name,
                    template_subject: this.emailTemplateForm.value.subject,
                    template: this.emailTemplateForm.value.template,
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.SEND_TEST_EMAIL_TEMPLATE, data, 'email-template', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    // this.router.navigate([`/${this.userBaseRoute}/email-template-list`]);
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
    onplaceTokenSelect(e: any) {
        if (e) {
            let actualName = e.replace(/[{} $]/g, "");
            actualName = actualName.replace(/[ _ ]/g, " ");
            let previousSubject = this.emailTemplateForm.value.subject;
            if (this.companyType == 'broker') {
                this.emailTemplateForm.patchValue({
                    subject: previousSubject + ' ' + `${e}`
                })
            } else {
                this.emailTemplateForm.patchValue({
                    subject: previousSubject + ' ' + `${this.transform(actualName)}: ${e}`
                })
            }
        }


        this.closeModal()
    }


    async openPlaceholderForm() {
        try {
            // this.editorRef = e;
            if (!Object.keys(this.personilizedVariables).length) {
                this.getPersonilzedVars();
            }
            this.modal = this.modalService.open(this.placeholdersVars);

        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    getOptionList() {
        let obj = this.crmUtilitiesType.filter(e => e.id == this.emailTemplateForm.value.crm_utility);
        if (obj) {
            this.emailTemplateForm.patchValue({
                attachments: ''
            })
            this.crmUtilityName = obj[0].name;
            if (obj[0].name == 'User of CRM') {
                this.emailTemplateForm.get('to_option')?.setValidators([Validators.required])
                this.emailTemplateForm.get('to_option')?.updateValueAndValidity();
                let obj2 = this.rolesList.filter(e => e.name == 'New User');
                if (obj2) {
                    let array = [];
                    array.push(obj2[0].id)
                    this.emailTemplateForm.patchValue({
                        to_option: array,
                    })
                }
            } else {
                if (this.emailTemplateForm.value.to_option.length == 1 && this.emailTemplateForm.value.to_option.includes('2RQHEgU~W6cyTKQigJrThg==')) {
                    this.emailTemplateForm.patchValue({
                        to_option: [],
                    })
                }
                if(obj[0].name =='Reset Password'){
                    this.emailTemplateForm.get('to_option')?.clearValidators();
                    this.emailTemplateForm.get('to_option')?.updateValueAndValidity();
                    }else{
                        this.emailTemplateForm.get('to_option')?.setValidators([Validators.required])
                        this.emailTemplateForm.get('to_option')?.updateValueAndValidity();
                    }
            }
        
        }
        if(obj[0].name =='Reset Password'){
            this.emailTemplateForm.get('to_option')?.clearValidators();
            this.emailTemplateForm.get('to_option')?.updateValueAndValidity();
            }else{
                this.emailTemplateForm.get('to_option')?.setValidators([Validators.required])
                this.emailTemplateForm.get('to_option')?.updateValueAndValidity();
            }
    }

    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }


    async checkEmailSet() {
        try {
            let data = {
                from_option: this.emailTemplateForm.value.from_option,
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.EMAIL_EXIST_EMAIL_TEMPLATE, data, 'email-template', 'update');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                if (response.data.exists == 0) {
                    Swal.fire({
                        title: response.message,
                        icon: 'warning',
                        // showCancelButton: true,
                        confirmButtonText: 'OK',
                        confirmButtonColor: this.color,
                    }).then((result) => {
                        if (result.value) {
                            this.emailTemplateForm.patchValue({ from_option: "" });
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            Swal.close()
                        }
                    })
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
    async getCompanyDocsList() {
        try {
            this.commonService.showSpinner();
            let url = `?&page_limit=${this.limit}&page=${this.page}`;
            const res$ = this.apiService.getReq(API_PATH.COMPANY_DOCUMENTS_LIST + url, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.companyDocuments = response.data.company_documents;
                // for (let i = 0; i < this.documentsList.length; i++) {
                //     if (this.documentsList[i].document_type != 'other') {
                //         this.docTypes = this.docTypes.filter(e => e.value != this.documentsList[i].document_type)
                //     }
                // }
            } else {
                this.companyDocuments = [];
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
    toOptionValue() {
        if (this.emailTemplateForm.value.to_option.includes('okwzu752eT5b8h6lWmgBgw==')) {
            this.showCustomEmail = true;
        } else {
            this.showCustomEmail = false;
        }
        this.custoEmailValidators();
    }
    custoEmailValidators() {
        if (this.showCustomEmail) {
            this.emailTemplateForm.get('custom_email')?.setValidators([Validators.required, Validators.pattern(Custom_Regex.EMAIL_REGEX_COMMA_SEPRATED)])
            this.emailTemplateForm.get('custom_email')?.updateValueAndValidity();
        } else {
            this.emailTemplateForm.get('custom_email')?.clearValidators();
            this.emailTemplateForm.get('custom_email')?.updateValueAndValidity();

        }
    }
    getAttachValue(){
        let docuemntSize = 0 ;
        this.companyDocuments.filter((e:any)=>{this.emailTemplateForm.value.attachments.filter((m:any)=>{if(e?.document_id == m){
        docuemntSize += Number(e?.document_size);
        }})})
        if(docuemntSize){
          if(docuemntSize/1024/1024 > 30){
             let msg = 'Document attachment limit has reached, you can\'t select more documents'
            Swal.fire({
                title:msg,
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: ' Ok',
                confirmButtonColor: this.color,
                cancelButtonText: 'Cancel'
            })
            let popattachment = this.emailTemplateForm.value.attachments.pop();
            this.emailTemplateForm.patchValue({
                attachments: this.emailTemplateForm.value.attachments
            })

          }else{

          }
        }   
    }

    getAttachValueISOSyndicate(){
        let docuemntSize = 0 ;
        this.companyDocuments.filter((e:any)=>{if(e.document_id == this.emailTemplateForm.value.attachments)
        docuemntSize = Number(e?.document_size);
    })
        if(docuemntSize){
          if(docuemntSize/1024/1024 > 15){
             let msg = 'Document attachment limit has reached, you can\'t select more documents'
            Swal.fire({
                title:msg,
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: ' Ok',
                confirmButtonColor: this.color,
                cancelButtonText: 'Cancel'
            })
            this.emailTemplateForm.patchValue({
                attachments: ''
            })

          }else{

          }
        }   
    }
}
