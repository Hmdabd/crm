import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-add-edit-bank-information',
    templateUrl: './add-edit-bank-information.component.html',
    styleUrls: ['./add-edit-bank-information.component.scss']
})
export class AddEditBankInformationComponent implements OnInit {
    bankInfoForm!: FormGroup;
    leadID: string = '';
    leadBank: any = {};
    editMode: boolean = false;
    countriesList: Array<any> = [];
    statesList: Array<any> = [];
    canUpdateBankDetails: boolean = false;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    @Input() leadDetails: any = {};
    @Output() updateLogs = new EventEmitter<any>();   
    companyType:string = '' 
    passwordType: boolean = true;
    constructor(private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,) { }

    ngOnInit(): void {
        this.canUpdateBankDetails = this.authService.hasPermission('bank-detail-update');
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
        } else {
            this.commonService.showError('');
        }
        this.initBankInfoForm();
        this.getCountries();
        this.getBankData();
        this.getUserDetails();

    }


    initBankInfoForm() {
        this.bankInfoForm = this.fb.group({
            bank_account_name: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.city),
                // Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            bank_account: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.city),
                Validators.pattern(Custom_Regex.digitsOnly),

                Validators.maxLength(20),
                // Validators.minLength(3),
            ]],
            bank_routing: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.address),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(100)
            ]],
            bank: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.city),
                // Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            bank_country: [''],
            account_type:[''],
            bank_state: [''],
            bank_city: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.city),
                // Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            bank_zip: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.digitsOnly)]],
            bank_website:['',[Validators.pattern(Custom_Regex.website), Validators.maxLength(100)]],
            user_name:['',[Validators.pattern(Custom_Regex.spaces)]],
            password:['', [Validators.pattern(Custom_Regex.password), Validators.maxLength(16)]],
            security:this.fb.array([])
        })
        // this.securityQuestionInit();
    }
    get SecurityQuestionArray(){
        return this.bankInfoForm.get('security') as FormArray;
    }
    securityQuestionForm(value:any){
        return this.fb.group({
            security_question:[value?.security_question?value?.security_question:'',[Validators.pattern(Custom_Regex.spaces)]]
        })
    }
    securityQuestionInit(value:any){
        return this.SecurityQuestionArray?.push(this.securityQuestionForm({}))

    }
    removeSecurityQuestion(i:number){
    this.SecurityQuestionArray.removeAt(i)
    }

    ngDoCheck():void{
        this.bankInfoForm.patchValue({
            bank_state:this.bankInfoForm.value.bank_state
        })
    }
    /**
       * @description get lead detail form controls
       */
    get baif(): { [key: string]: AbstractControl } {
        return this.bankInfoForm.controls;
    }

    async onBankInfoSubmit() {
        this.commonService.showSpinner();
        this.bankInfoForm.markAllAsTouched();
        if (this.bankInfoForm.valid) {
            try {
                let data = {
                    // lead_id: this.submittedLeadID,
                    lead_id: this.leadID,
                    ...this.bankInfoForm.value,
                };
                const res$ = this.apiService.postReq(API_PATH.LEAD_BANK_DETAIL_SUBMIT, data, 'lead', 'create');
                let response = await lastValueFrom(res$);
                if (response && response.api_response == 'success') {
                    this.updateLogs.emit();
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID],
                        { queryParams: { activeTab: 'Documents' } });
                        // { queryParams: { activeTab: 'Updates' } });
                        
                        
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
        } else {
            this.commonService.hideSpinner();
        }

    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    cancel() {
        this.editMode = !this.editMode;
        // this.getBankData();
    }

    onCountryChange(countryId: any): void {
        this.getStates(countryId, false);
    }
    /**
* @description get countries list
* @author Shine Dezign Infonet Pvt. Ltd.
*/
    async getCountries() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.COUNTRIES_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.countriesList = response.data;
                let i = this.countriesList.findIndex((e) => e.name === "United States");
                if (i > -1) {
                    this.bankInfoForm.get('bank_country')?.patchValue(this.countriesList[i].id);
                    this.getStates(this.countriesList[i].id, true);
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
     * @description get states list
     * @param country_id 
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async getStates(country_id: string, patchValue: boolean) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                if (!patchValue) {
                    this.bankInfoForm.patchValue({ bank_state: "" });
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
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.getColorOnUpdate();
            this.style = { fill: ud?.color };
            this.background = { background: ud?.color };
            this.companyType = ud?.company_type;

        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
    async getBankData() {
        this.getBankDetails();
        // if (this.leadBank.bank_country) {
        //     this.getStates(this.leadBank.bank_country, false);
        // }
        // this.patchBankInfo();

    }
    patchBankInfo() {
        this.bankInfoForm.patchValue({
            bank_account_name: this.leadBank.bank_account_name,
            bank_account: this.leadBank.bank_account,
            bank_routing: this.leadBank.bank_routing,
            bank: this.leadBank.bank,
            bank_country: this.leadBank.bank_country,
            // bank_state: this.leadBank.bank_state,
            bank_city: this.leadBank.bank_city,
            bank_zip: this.leadBank.bank_zip,
            account_type:this.leadBank?.account_type,
            user_name:this.leadBank?.user_name,
            password:this.leadBank?.password,
            bank_website:this.leadBank?.bank_website,
        });
        //
        if(this.leadBank?.security.length){
          this.leadBank?.security.forEach((e:any)=>{
            this.SecurityQuestionArray?.push(this.securityQuestionForm(e))
          })
        }else{
            this.securityQuestionInit(true)
        }
        setTimeout(() => {
            this.bankInfoForm.patchValue({
                bank_state: this.leadBank.bank_state,
            })
        });
        
    }
    async getBankDetails() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_BANK + this.leadID, 'lead', 'edit');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.leadBank = response.data;
                if (this.leadBank.bank_country) {
                    this.getStates(this.leadBank.bank_country, true);
                }
                this.patchBankInfo();
                this.commonService.hideSpinner();
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

}
