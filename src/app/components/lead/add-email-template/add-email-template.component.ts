import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { ApiService } from '@services/api.service';
import { API_PATH } from '@constants/api-end-points';
import { CommonService } from '@services/common.service';
import { lastValueFrom, map, Subscription } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CKEditorComponent } from 'ng2-ckeditor';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Custom_Regex, SETTINGS } from '@constants/constants';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import Swal from 'sweetalert2';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EMPTY } from 'rxjs'
import { EILSEQ } from 'constants';



@Component({
    selector: 'app-add-email-template',
    templateUrl: './add-email-template.component.html',
    styleUrls: ['./add-email-template.component.scss']
})
export class AddEmailTemplateComponent implements OnInit {
    modal!: NgbModalRef;
    isoModal!: NgbModalRef;
    emailTemplatesList: Array<any> = [];
    selectedTemplate: any;
    emailTemplateHTML: any;
    emailSubject: string = '';
    emailTemplateForm!: FormGroup;
    template_name: any;
    subject: any;
    template: any;
    name = 'ng2-ckeditor';
    ckeConfig: any = CKEDITOR.config;
    mycontent: string | undefined;
    log: string = '';
    @ViewChild("myckeditor")
    ckeditor!: CKEditorComponent;
    firstTemplateKey: any;
    canAddTemplate: boolean = false;
    personilizedVariables: any = [];
    // editorRef!: AngularEditorComponent;
    editorRef!: any;
    imageUrl: string = '';
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
    @ViewChild('placeholdersVars') placeholdersVars!: ElementRef;
    @ViewChild('ISOdocument') isoDocument!: ElementRef
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    crmUtilitiesType: Array<any> = [];
    alreadyExistsCrmUtility: number = 0;
    crmUtilityName: string = '';
    companyType: string = '';
    companyDocuments: Array<any> = [];
    page: number = 1;
    limit: number = 2000;
    showCustomEmail: boolean = false;
    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        public fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private modalService: NgbModal,
        private ngxLoader: NgxUiLoaderService

    ) { }

    ngOnInit(): void {
        this.canAddTemplate = this.authService.hasPermission('email-template-add');
        this.initEmailTemplateForm();
        this.getUserDetails();
        this.getLeadOptions();
        this.getPersonilzedVars();
        this.getRolesOptions();
        this.getCompanyDocsList();
        // this.getEmailTemplateData();
        this.ckeConfig = {
            //extraPlugins: 'divarea',
            forcePasteAsPlainText: true,
            removePlugins: 'exportpdf',
            toolbarLocation: 'bottom',
            height: '350',
            toolbarGroups: [{
                "name": "basicstyles",
                "groups": ["basicstyles"]
            },
            {
                "name": "links",
                "groups": ["links"]
            },
            {
                "name": "list",
                "groups": ['list', 'indent', 'align', 'NumberedList', 'BulletedList', 'todoList', '-', 'Outdent', 'Indent', '-', 'Blockquote']
            },
            {
                "name": "insert",
                "groups": ["insert"]
            },
            {
                "name": "tools",
                "groups": ["Maximize"]
            }, {
                "name": "custom"
            }
            ],
            // Remove the redundant buttons from toolbar groups defined above.
            removeButtons: 'Strike,Subscript,Superscript,Anchor,SpecialChar,PasteFromWord,ShowBlocks,blocks,bidi,Iframe,PageBreak',
            allowedContent: true
        };
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                this.color = ud?.color;
                this.companyType = ud.company_type;
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
            template_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(100),
                // Validators.minLength(3)
            ]],


            template_type: ['', [Validators.required,]],
            send_application_attachment: [1],
            crm_utility: [''],
            // is_default: [0, [Validators.required,]],
            // lead_status:  [''],
            subject: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(100),
                // Validators.minLength(3)
            ]],
            status: [1],
            send_bcc: [0],
            from_option: ['', [Validators.required]],
            to_option: [''],
            bcc_option: [''],
            keep_renewal_user: [0],
            template: ['', [Validators.required]],
            attachments: [''],
            custom_email: ['']
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
                this.fromOptions = response.data.from_options,
                    this.leadStatusList = response.data.status;
                this.crmUtilitiesType = response.data.crm_utilities
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

    async addemailTemplateFormSubmit(): Promise<void> {
        this.emailTemplateForm.markAllAsTouched();
        this.custoEmailValidators();

        if (this.emailTemplateForm.valid) {
            try {
                let data = {
                    ...this.emailTemplateForm.value,
                    already_exist: this.alreadyExistsCrmUtility,
                    attachments: this.crmUtilityName == 'ISO' || this.crmUtilityName == 'Syndicate' ? this.emailTemplateForm.value.attachments.split() : this.emailTemplateForm.value.attachments,
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.ADD_EMAIL_TEMPLATE, data, 'email-template', 'add');
                let response = await lastValueFrom(res$);
                if (response) {
                    //    console.log(response)
                    this.commonService.showSuccess(response.message)
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
                            this.addemailTemplateFormSubmit();
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
    async handleContinue(): Promise<void> {
        this.emailTemplateForm.markAllAsTouched();
        this.custoEmailValidators();
        if (this.emailTemplateForm.valid) {
            Swal.fire({
                title: 'Please confirm your template name and subject',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: ' Ok',
                // "#f0412e"
                confirmButtonColor: this.color,
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.value) {
                    Swal.fire({
                        title: 'Please select the action !',
                        // html:'<input type="checkbox"  id="checkbox1" value="Save"> <label for="save">Save</label><input type="checkbox" id="checkbox2" value="sendEmail"> <label for="sendEmail">Send Test Email</label> ',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Save',
                        confirmButtonColor: this.color,
                        cancelButtonText: 'Send Test Email & Save',
                        customClass: 'swal-wide',
                        // cancelButtonColor:"#D51B07",

                    }).then((result) => {
                        if (result.value) {
                            this.addemailTemplateFormSubmit()
                            Swal.close()
                            // console.log(result.value)
                            // if (response) {
                            //     this.commonService.showSpinner();
                            //     this.commonService.showSuccess(response.message);
                            //     this.router.navigate([`/${this.userBaseRoute}/email-template-list`]);
                            // }
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            this.saveAndTestEmail();
                            Swal.close()
                        }
                    })
                    if (result.dismiss === Swal.DismissReason.cancel) {
                        Swal.close()
                    }
                }
            })
        }

    }


    async openPeronisedForm(e: any) {
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
    async openISODocumentForm(e: any) {
        try {
            this.editorRef = e;
            if (!Object.keys(this.personilizedVariables).length) {
                this.getPersonilzedVars();
            }
            this.isoModal = this.modalService.open(this.isoDocument);

        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    closeIsoModal() {
        if (this.isoModal)
            this.isoModal.close();
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
    transform(value: any): any {
        let first = value.substr(0, 1).toUpperCase();
        return first + value.substr(1);
    }

    onTokenSelect(e: any) {
        // console.log("jii", e.target.value);
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
        this.closeModal()
    }
    getCapitalizeName(name: any) {
        let actualName = name.replace(/[{} $]/g, "");
        actualName = actualName.replace(/[ _ ]/g, " ")
        return this.transform(actualName)
    }
    async saveAndTestEmail(): Promise<void> {
        this.emailTemplateForm.markAllAsTouched();
        this.custoEmailValidators();
        if (this.emailTemplateForm.valid) {
            try {
                let data = {
                    ...this.emailTemplateForm.value,
                    already_exist: this.alreadyExistsCrmUtility
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.ADD_EMAIL_TEMPLATE, data, 'email-template', 'add');
                let response = await lastValueFrom(res$);
                if (response) {
                    //    console.log(response)
                    this.commonService.showSuccess(response.message);
                    this.sendTestEmail();
                    //    this.router.navigate([`/${this.userBaseRoute}/email-template-list`]);
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
                            this.saveAndTestEmail();
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
    async sendTestEmail(): Promise<void> {
        this.emailTemplateForm.markAllAsTouched();
        this.custoEmailValidators();
        if (this.emailTemplateForm.valid) {
            try {
                let data = {
                    // ...this.emailTemplateForm.value,
                    // template_subject:this.emailTemplateForm.get('subject')?.value,
                    template_name: this.emailTemplateForm.value.template_name,
                    template_subject: this.emailTemplateForm.value.subject,
                    template: this.emailTemplateForm.value.template,
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.SEND_TEST_EMAIL_TEMPLATE, data, 'email-template', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/email-template-list`]);
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
    getOptionList() {
        try {
            let obj = this.crmUtilitiesType.filter(e => e.id == this.emailTemplateForm.value.crm_utility);
            // console.log("obj", obj);
            
            if (obj) {
                this.emailTemplateForm.patchValue({
                    attachments: ''
                })
                this.crmUtilityName = obj[0].name;
                if (obj[0].name == 'User of CRM') {
                    // console.log("In if");

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
                } 
                else {
                    // console.log("In else");
                    // console.log("this.emailTemplateForm.value.to_option", this.emailTemplateForm.value.to_option);
                    // console.log("this.emailTemplateForm.get('to_option')", this.emailTemplateForm.get('to_option'));
                    
                    if(this.emailTemplateForm.value.to_option.length == 1 && this.emailTemplateForm.value.to_option.includes('2RQHEgU~W6cyTKQigJrThg==')){
                        this.emailTemplateForm.patchValue({
                            to_option: [],
                        })}
                    }   
                    if(obj[0].name =='Reset Password'){
                        this.emailTemplateForm.get('to_option')?.clearValidators();
                        this.emailTemplateForm.get('to_option')?.updateValueAndValidity();
                        // console.log("Reset Password if", this.emailTemplateForm);
                        
                        }else{

                            this.emailTemplateForm.get('to_option')?.setValidators([Validators.required])
                            this.emailTemplateForm.get('to_option')?.updateValueAndValidity();
                        // console.log("Reset Password else", this.emailTemplateForm);

                        }
            }
        } catch (error) {
            console.log("error", error); 
        }
       
     

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
            let reqData: any = {
                page: this.page,
                records_per_page: this.limit,
            }
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


