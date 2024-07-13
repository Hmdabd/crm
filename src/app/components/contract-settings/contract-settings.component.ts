import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
	selector: 'app-contract-settings',
	templateUrl: './contract-settings.component.html',
	styleUrls: ['../lead/creating-contract/creating-contract.component.scss', './contract-settings.component.scss']
})
export class ContractSettingsComponent implements OnInit {
	contractForm!: FormGroup;
	userRole: string = '';
	style!: { fill: string; };
	color!: string;
	background!: { background: string; };
	colorSubs!: Subscription;
	bool: boolean = false;
	bool1: boolean = false;
	contractDetails: any = {};
	preFundAdvancetype: Array<any> = [];
	pointsList: Array<any> = [];
	fundingValue: any = 0;

	constructor(
		private fb: FormBuilder,
		private apiService: ApiService,
		private commonService: CommonService,
		private route: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
	) { }

	ngOnInit(): void {
		this.initcontractForm();
		this.getUserDetails();
		this.getContractDetailsList();
	}
	initcontractForm() {
		this.contractForm = this.fb.group({
			ach_program_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
			ucc_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
			wire_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
			nsf_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
			ach_rejection_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
			bank_change_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
			default_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
			ucc_release_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
			underwriting_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
			blocked_account_fee: ['', [Validators.pattern(Custom_Regex.amount)]],
		})

	}

	/**
	 * @description get lead detail form controls
	 */
	get f(): { [key: string]: AbstractControl } {
		return this.contractForm.controls;
	}
	getUserDetails(): void {
		try {
			let ud = this.authService.getUserDetails();
			if (ud) {
				this.userRole = ud.role;
				this.getColorOnUpdate();
				this.style = { fill: ud?.color };
				this.color = ud?.color;
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
	async getContractDetailsList(): Promise<any> {
		try {
			let url = ''
			// if(this.contractDetails.id){
			// 	 url = `?id=${this.contractDetails.id}`;
			// }
			this.commonService.showSpinner();
			const res$ = this.apiService.getReq(API_PATH.GET_CONTRACT_SETTINGS_LIST, 'contract', 'setting');
			let response = await lastValueFrom(res$);
			if(response){
				this.contractDetails = response.data;
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
	patchValues(): void {	  
           this.contractForm.patchValue({
			ach_program_fee: this.contractDetails.ach_program_fee,
			ucc_fee: this.contractDetails.ucc_fee,
			wire_fee: this.contractDetails.wire_fee,
			nsf_fee: this.contractDetails.nsf_fee,
			ach_rejection_fee: this.contractDetails.ach_rejection_fee,
			bank_change_fee: this.contractDetails.bank_change_fee,
			default_fee: this.contractDetails.default_fee,
			ucc_release_fee: this.contractDetails.ucc_release_fee,
			underwriting_fee: this.contractDetails.underwriting_fee,
			blocked_account_fee: this.contractDetails.blocked_account_fee
            })

    }
	async onSubmitContactForm() {
		this.contractForm.markAllAsTouched();
		if (this.contractForm.valid) {
			let data = {
				id: this.contractDetails.id,
				...this.contractForm.value,
			}
			try {
				this.commonService.showSpinner();
				const res$ = this.apiService.postReq(API_PATH.CONTRACT_SETTINGS_STORE, data, 'contract', 'setting');
				let response = await lastValueFrom(res$);
				if (response.api_response == 'success') {
					this.commonService.showSuccess(response.message)
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
		}

	}
	get userBaseRoute() {
		return this.authService.getUserRole().toLowerCase();
	}

}
