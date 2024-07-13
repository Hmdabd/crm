import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-creating-contract',
	templateUrl: './creating-contract.component.html',
	styleUrls: ['./creating-contract.component.scss']
})
export class CreatingContractComponent implements OnInit {
	leadID: string = '';
	contractForm!: FormGroup;
	userRole: string = '';
	lead: any = {};
	style!: { fill: string; };
	color!: string;
	background!: { background: string; };
	colorSubs!: Subscription;
	contractDetails: any = {};
	preFundAdvancetype: Array<any> = [];
	pointsList: Array<any> = [];
	fundingValue: any = 0;
	companyType: string = '';
	businessArray: Array<any> = [];
	dateFormat: string = '';
	timeZone: string = '';
	bool: boolean = false;
	suggestedOffer: boolean = false;

	constructor(
		private fb: FormBuilder,
		private apiService: ApiService,
		private commonService: CommonService,
		private route: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
		private cdr: ChangeDetectorRef,

	) { }

	ngOnInit(): void {
		this.initcontractForm();
		this.getDropdownOptions();
		let params = this.route.snapshot.params;
		if (params && params['id']) {
			this.leadID = params['id'];
			this.getContractDetailsList();
		} else {
			this.commonService.showError('');
		}
		this.getUserDetails();
	}
	/**
   * @description initialize lead details form
   */
	initcontractForm() {
		this.contractForm = this.fb.group({
			specified_percentage: ['', [Validators.required]],
			// origination: ['', [
			// 	Validators.pattern(Custom_Regex.spaces),
			// 	// Validators.minLength(3),
			// 	Validators.maxLength(100)
			// ]],
			origination: ['', [
				Validators.pattern(Custom_Regex.digitsOnly),
				// Validators.minLength(3),
				Validators.maxLength(100)
			]],
			initial_amount_type: ['', [
				Validators.required
			]],
			payment_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
			bank: ['', [
				Validators.required,
				Validators.pattern(Custom_Regex.spaces),
				Validators.pattern(Custom_Regex.username),
				Validators.pattern(Custom_Regex.name),
				// Validators.minLength(3),
				Validators.maxLength(100)
			]],
			account_number: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
			account_name: ['', [
				Validators.required,
				Validators.pattern(Custom_Regex.spaces),
				Validators.pattern(Custom_Regex.username),
				Validators.pattern(Custom_Regex.name),
				// Validators.minLength(3),
				Validators.maxLength(100)]],
			funding_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
			routing_number: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
			rtr: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
			// overide_package_validation: [false],
			// overide_package_validation: [false, [Validators.requiredTrue]],
			// display_suggested_offer: [false],
			// display_suggested_offer: [false, [Validators.requiredTrue]],
			add_business: this.fb.array([]),
		});

		//		this.addBussiness(true);
	}
	get additionalBussinessArray() {
		return this.contractForm.get('add_business') as FormArray
	}
	additionalBussinessForm(value: any, status: any) {
		return this.fb.group({
			other_business: [value?.other_business ? value?.other_business : '', [Validators.pattern(Custom_Regex.spaces)]],
			business_address: [value?.business_address ? value?.business_address : '', [Validators.pattern(Custom_Regex.spaces)]],
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
		return this.contractForm.controls;
	}
	async onSubmitContactForm() {
		this.contractForm.markAllAsTouched();
		let obj = this.pointsList.filter(e => e.id == this.contractForm.value.specified_percentage);
		let actualpercentage = ''
		if (obj.length) {
			actualpercentage = obj[0].name
		} else {
			actualpercentage = ''
		}
		let obj2 = this.preFundAdvancetype.filter(e => e.id == this.contractForm.value.initial_amount_type);
		let actualamountType = ''
		if (obj2.length) {
			actualamountType = obj2[0].name
		} else {
			actualamountType = ''
		}
		if (this.contractForm.valid) {
			let currentDate = new Date()
			let data = {
				...this.contractForm.value,
				// specified_percentage: actualpercentage,
				initial_amount_type: actualamountType,
				lead_id: this.leadID,
				contract_created_date: this.getDate(currentDate)
			}
			try {
				this.commonService.showSpinner();
				const res$ = this.apiService.postReq(API_PATH.CREATE_CONTRACT, data, 'lead', 'contract');
				let response = await lastValueFrom(res$);
				if (response.api_response == 'success') {
					this.commonService.showSuccess(response.message)
					this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);

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
	// specifiedPercentage(value: any) {
	// 	if (value > 100) {
	// 		this.commonService.showError("Specified percentage should be less than 100");
	// 		this.contractForm.patchValue({ specified_percentage: '' })
	// 	}
	// }

	/**
* @description get user details from localstrorage
* @author Shine Dezign Infonet Pvt. Ltd.
* @returns {void}
*/
	getUserDetails(): void {
		try {
			let ud = this.authService.getUserDetails();
			if (ud) {
				this.userRole = ud.role;
				this.companyType = ud.company_type;
				this.style = { fill: ud?.color };
				this.color = ud?.color;
				this.background = { background: ud?.color };
				this.dateFormat = ud?.date_format;
				this.timeZone = ud?.time_zone;
				this.getColorOnUpdate();
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

	getLeadBasicDetails(leadData: any) {
		setTimeout(() => {
			if (leadData) {
				this.lead = leadData;
				// this.getSpecificPercentage();
			}
		}, 1000)



	}

	override() {
		if (this.contractForm.value.overide_package_validation === true) {
			this.bool = true;
		} else {
			this.bool = false;
		}

	}
	display_suggested() {
		if (this.contractForm.value.display_suggested_offer === true) {
			this.suggestedOffer = true;

		} else {
			this.suggestedOffer = false;
		}
	}

	async getContractDetailsList(): Promise<any> {
		try {
			let url = `?lead_id=${this.leadID}`;
			this.commonService.showSpinner();
			const res$ = this.apiService.getReq(API_PATH.GET_LEAD_CONTRACTS_DETAILS + url, 'lead', 'view');
			let response = await lastValueFrom(res$);
			if (response) {
				this.contractDetails = response.data;
				if (response.data.add_business) {
					this.businessArray = response.data.add_business;
					for (let i = 0; i < response.data.add_business?.length; i++) {
						this.additionalBussinessArray.push(
							this.additionalBussinessForm(response.data.add_business[i], false)
						);
					}
				}

				if (!this.businessArray.length && !this.additionalBussinessArray.length) {
					this.addBussiness(true);
				}
				this.patchValues();

				//this.patchValues();
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
	async getDropdownOptions() {
		try {
			this.commonService.showSpinner();
			const res$ = this.apiService.postReq(API_PATH.GET_PRE_FUND_DROPDOWNS, { group_name: ['pre_fund_advance_type', 'points'] }, '', '');
			let response = await lastValueFrom(res$);
			if (response && response.data) {
				this.preFundAdvancetype = response.data.pre_fund_advance_type;
				// console.log('preFundAdvancetype',this.preFundAdvancetype);

				this.pointsList = response.data.points
				let array = [];
				for (let i = 0; i < this.preFundAdvancetype.length; i++) {
					// if () {
						let text = this.preFundAdvancetype[i].name.toString().replace("ACH", "");
						this.preFundAdvancetype[i].name = text;
						if(this.companyType == 'funded'){
							if(this.preFundAdvancetype[i].name == "Weekly " || this.preFundAdvancetype[i].name == "Daily "){
								array.push(this.preFundAdvancetype[i]);
							}
						}else{
							if(this.preFundAdvancetype[i].name == "Bi-Weekly " || this.preFundAdvancetype[i].name == "Monthly " ||  this.preFundAdvancetype[i].name == "Weekly " || this.preFundAdvancetype[i].name == "Daily "){
								array.push(this.preFundAdvancetype[i]);
							}
						}
						// array.push(this.preFundAdvancetype[i]);
					// }
				}
				// console.log('status',array);
				
				this.preFundAdvancetype = array;
				this.contractForm.patchValue({ initial_amount_type: this.preFundAdvancetype[0].id });

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
		this.fundingValue = Number(this.contractDetails.funding_amount);
		let fundingAmount: any = 0
		fundingAmount = this.fundingValue.toFixed(2);
		if (fundingAmount.split('.').length > 1) {
			fundingAmount.split('.')[1] = '00';
			fundingAmount = (+(fundingAmount) + 0.0000001).toString();
		}
		setTimeout(() =>
		this.contractForm.patchValue({
			// specified_percentage: this.contractDetails.percentage,
			specified_percentage: Number(this.contractDetails.percentage) > 100 ? '100' : Math.ceil(this.contractDetails.percentage),
			origination: this.companyType == 'funded' && this.contractDetails.origination == '' ? 5 : this.contractDetails?.origination,
			initial_amount_type: this.contractDetails.amount_type,
			account_number: this.contractDetails.bank_account,
			payment_amount: this.contractDetails.payment_amount,
			account_name: this.contractDetails.bank_account_name,
			bank: this.contractDetails.bank,
			routing_number: this.contractDetails.bank_routing,
			funding_amount: fundingAmount,
			rtr: this.contractDetails.rtr,
		}));
		// console.log('this.contractDetails',this.contractDetails);
		
	  if(Number(this.contractDetails.percentage) > 100){
		Swal.fire({
			title: 'Original value of specified percentage ' + Number(this.contractDetails.percentage).toFixed(2) + '% which exceed 100 limit',
			icon: 'warning',
			// showCancelButton: true,
			confirmButtonText: 'OK',
			confirmButtonColor: this.color,
		}).then((result) => {
			if (result.value) {
			} else if (result.dismiss === Swal.DismissReason.cancel) {
				Swal.close()
			}
		})
	  }




	}
	get zeroTo100() {
		let total_Value: any = []
		for (let i = 0; i <= 100; i++) {
			total_Value.push(i);

		}
		return total_Value;
	}
	get userBaseRoute() {
		return this.authService.getUserRole().toLowerCase();
	}

	// getSpecificPercentage() {
	// 	let value = Number(this.lead?.total_monthly_true_revenue);
	// 	let monthly_payment = Number(this.lead?.daily_payment) * 21;
	// 	if (value != 0) {
	// 		let seqValue = 0
	// 		seqValue = Number(monthly_payment) / Number(value);
	// 		if (seqValue < 1) {
	// 			seqValue = seqValue * 100
	// 		} else {
	// 			seqValue
	// 		}


	// 		if (this.companyType == 'funded') {
	// 			if (seqValue > 100) {
	// 				return
	// 			}
	// 			if (!Number.isNaN(seqValue)) {
	// 				this.contractForm.patchValue({ specified_percentage: Math.round(seqValue) })
	// 			}
	// 		}
	// 	}

	// }
	// this.contractForm.patchValue({origination:5})

	//Updated:-28-08-2023 specific percentage
	// getSpecificPercentage() {
	// 	let value = Number(this.lead?.monthly_true_revenue);
	// 	let monthly_payment = Number(this.lead?.daily_payment) * 21;
	// 	if (value != 0) {
	// 		let seqValue = 0
	// 		seqValue = Number(monthly_payment) / Number(value);
	// 		if (seqValue < 1) {
	// 			seqValue = seqValue * 100
	// 		} else {
	// 			seqValue
	// 		}
	// 		if (this.companyType == 'funded') {
	// 			if (seqValue > 100) {
	// 				return
	// 			}
	// 			if (!Number.isNaN(seqValue)) {
	// 				this.contractForm.patchValue({ specified_percentage: Math.round(seqValue) })
	// 			}
	// 		}
	// 	}
	// }

	ngAfterContentChecked() {
		this.cdr.detectChanges();
	}

	getDate(date: any) {
		let newDate = this.commonService.getExactDate(moment(date));
		return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
	}

}

