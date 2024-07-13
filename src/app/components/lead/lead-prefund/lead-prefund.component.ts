import { Component, ElementRef, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Roles } from '@constants/constants';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-lead-prefund',
    templateUrl: './lead-prefund.component.html',
    styleUrls: ['./lead-prefund.component.scss']
})
export class LeadPrefundComponent implements OnInit {
    preFundForm: FormGroup | any;
    lenderList: Array<any> = [];
    leadID: string = '';
    maxDate!: NgbDateStruct;
    preFundtype: Array<any> = [];
    preFundAdvancetype: Array<any> = [];
    preFundUnittype: Array<any> = [];
    agentList: Array<any> = [];
    lead: any = {};
    userRole: string = '';
    prefundingData: any = {};
    agentArray: Array<any> = [];
    todayDate: string = '';
    leadSourceList: Array<any> = [];
    labelRemit: string = 'Weekly'
    labelTerm: string = 'Weeks'
    @ViewChild('dob',) DOB!: ElementRef;
    viewMode: boolean = false;
    editMode: boolean = false;
    companyType: string = '';
    agentListLimit: number = 1000;
    agentListPage: number = 1
    background!: { background: string; };
    style!: { fill: string; };
    colorSubs!: Subscription;
    checkBoxColor2: boolean = false;
    checkBoxColor: boolean = false;
    checkBoxColor_agent: boolean = false;
    color!: string;
    checkBoxColor_agent2: boolean = false;
    userDetails: any = {};
    agentIndex: number = 0;
    payrollToFund:boolean = false;
    totalCommission:any = [];
    isoList:Array<any> = [];
    leadNumber:any='';
    // UpFrontBrokerCommission:any =0;
    updatedUpfrontCommission:any = 0;
    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private commonService: CommonService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private calendar: NgbCalendar,
        private formatter: NgbDateParserFormatter,
        private cdr:ChangeDetectorRef,
        // private parserFormatter: NgbDateParserFormatter,
    ) { }

    ngOnInit(): void {
        this.maxDate = this.calendar.getToday();
        this.getDropdownOptions();
        let d = new Date();
        let day: any = d.getDate();
        if (day.toString().length < 2) {
            day = '0' + day;
        }
        let month: string | number = (d.getMonth() + 1);
        if (month.toString().length < 2) {
            month = '0' + month;
        }
        this.todayDate = `${month}-${day}-${d.getFullYear()}`
        // this.todayDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
        // this.todayDate = `${d.getMonth() + 1}-${day}-${d.getFullYear()}`
        this.initPreFundForm();
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
        } else {
            this.commonService.showError('');
        }
        let query = this.route.snapshot.queryParams;

        if (query['mode'] && query['mode'] === 'edit') {

            this.editMode = true;

        }
        if (query['mode'] && query['mode'] === 'view') {
            this.viewMode = true;
        }
        // this.getAgentList();
        this.getAgentDropdownList();
        this.getUserDetails();
        this.getLeadOptions();
        //  this.getPreFunding();
        if (this.preFundAdvancetype.length) {
        }
    // payroll section view
    this.route.queryParams.subscribe(params => {
        if(params['detail'] && this.companyType == 'broker'){
       this.payrollToFund = params['detail'];
        }
        });
        if(this.companyType == 'broker'){
        this.getLenderOptions();
        }else{
            this.getISOList();
        }
      
   
    }


 

    /**
    * @description get user details from localstrorage
    * @author Shine Dezign Infonet Pvt. Ltd.
    * @returns {void}
    */
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userDetails = ud;
                this.userRole = ud.role;
                this.companyType = ud.company_type;
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

    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }




    getAdvancedType() {
        if (this.preFundAdvancetype.length) {
            let data = this.preFundForm.get('advance_type')?.value
            for (let x of this.preFundAdvancetype) {
                if (data === x?.id) {
                    const ACH = x.name;
                    this.labelRemit = ACH.replace('ACH', '');
                    if (ACH == 'Daily ACH') {
                        this.labelTerm = 'Days'
                    } else if (ACH == 'Weekly ACH') {
                        this.labelTerm = 'Weeks'
                    } else if (ACH == 'Bi-Weekly ACH') {
                        this.labelTerm = 'Bi-Weeks'

                    } else if (ACH == 'Monthly ACH') {
                        this.labelTerm = 'Months'
                    } else if (ACH == 'Variable ACH') {
                        this.labelTerm = 'Variable'
                    } else {
                        this.labelTerm = x.name;
                    }


                }
            }
        }
    }
    ngAfterViewInit(): void {
        if (this.DOB) {
            Inputmask('datetime', {
                inputFormat: 'mm-dd-yyyy',
                placeholder: 'mm-dd-yyyy',
                alias: 'datetime',
                min: '01-01-1920',
                max: this.todayDate,
                clearMaskOnLostFocus: false,
            }).mask(this.DOB.nativeElement);
        }
       
    }

    initPreFundForm(): void {
        this.preFundForm = this.fb.group({
            company_name: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.maxLength(100),
                // Validators.minLength(3),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
            ]],
            funding_date: ['', [Validators.required]],
            funding_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            type_of_fund: [''],
            factor_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            buy_rate: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            payback_amount: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            lender_id: ['', [Validators.required]],
            upfront_broker_commission: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            total_earnings: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            advance_type: ['', [Validators.required]],
            weekly_remit: [0, [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            unit_type: ['', [Validators.required]],
            term_in_weeks: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            closer_agent_id: [''],
            total_points: ['', [Validators.required, ]],
            retail_points: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            upfront_fee: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            lead_source: [''],
            lead_iso:[''],
            // upfront_broker_commission_on: ['funding'],
            // , [Validators.required]
            agent_commision: ['percentage'],
            agent_form: this.fb.array([]),

        });
        // this.addAgentForm(true);

    }
    getSumLenderCommission(value2: any) {
        let sum = 0;
        for (let i = 0; i < this.agentFArray.length; i++) {
            if (value2 == 'lender_commission') {
                sum += Number(this.agentFArray.controls[i].value.lender_commission);
            } else {
                sum += Number(this.agentFArray.controls[i].value.upfront_commission);
            }
        }
        return sum
    }
    specifiedPercentage(value: any, index: any) {
        if(this.preFundForm.value.agent_commision === 'percentage'){
            if (value == 'lender_commission') {
                for (let i = 0; i < this.agentFArray.length; i++) {
                    // this.agentFArray.controls[i].value.lender_commission > 100
                    if (this.getSumLenderCommission('lender_commission') > 100) {
                        this.commonService.showError("Lender commission should be less than 100");
                        this.agentFArray.at(index).patchValue({ "lender_commission": '' })
                    }
                }
            } else {
                for (let i = 0; i < this.agentFArray.length; i++) {
                    if (this.getSumLenderCommission('upfront_commission') > 100) {
                        this.commonService.showError("Upfront commission should be less than 100");
                        this.agentFArray.at(index).patchValue({ "upfront_commission": '' })
                    }
                }
            }
        }else{
            if (value == 'lender_commission') {
                for (let i = 0; i < this.agentFArray.length; i++) {
                    // this.agentFArray.controls[i].value.lender_commission > 100
                    if (this.getSumLenderCommission('lender_commission') > Number(this.preFundForm.value.upfront_broker_commission)) {
                        this.commonService.showError(`Lender commission should be less than ${Number(this.preFundForm.value.upfront_broker_commission).toFixed(2)}`);
                        this.agentFArray.at(index).patchValue({ "lender_commission": '' })
                    }
                }
            } else {
                for (let i = 0; i < this.agentFArray.length; i++) {
                    if (this.getSumLenderCommission('upfront_commission') > Number(this.preFundForm.value.upfront_fee)) {
                        this.commonService.showError(`Upfront commission should be less than ${Number(this.preFundForm.value.upfront_fee).toFixed(2)}`);
                        this.agentFArray.at(index).patchValue({ "upfront_commission": '' })
                    }
                }
            }

        }
    }

    get p(): { [key: string]: AbstractControl } {
        return this.preFundForm.controls;
    }

    get agentFArray() {
        return this.preFundForm.get('agent_form') as FormArray;
    }


    agentForm(value: any, status: any) {
        return this.fb.group({
            agent_id: [value?.agent_id ? value?.agent_id : ''],
            lender_commission: [value?.lender_commission ? value?.lender_commission : ''],
            upfront_commission: [value?.upfront_commission ? value?.upfront_commission : ''],
            agent_placeholder: [value?.agent_placeholder ? value?.agent_placeholder : 'User'],
             user_type: [value?.agent_placeholder == 'Assigned ISO' ? 'ISO' : 'User'],
            // agent_id: [value.agent_id ? value.agent_id : ''],
            // lender_commission: [value.lender_commission ? value.lender_commission : '', [Validators.pattern(Custom_Regex.amount)]],
            // upfront_commission: [value.upfront_commission ? value.upfront_commission : '', [Validators.pattern(Custom_Regex.amount)]],
        })
    }
    addAgentForm(value: any) {
        this.agentFArray.push(this.agentForm({}, value));
    }

    removeAgentForm(i: number) {
        this.agentFArray.removeAt(i);
    }

    async getLenderOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LENDER_LIST, { lead_id: this.leadID }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lenderList = response.data;                
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

    async getPreFunding() {
        try {
            let url = `?&lead_id=${this.leadID}`
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_PRE_FUNDING + url, 'lead', 'fund-record');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.prefundingData = response.data;
                this.leadNumber = this.prefundingData.lead_number
                // this.agentList.push(this.prefundingData?.assigned_user);
                this.patchValues();
                this.agentArray = response.data.agents;
                let agentIDs = response?.data?.agents ? response?.data?.agents.map((e: any, i: number) => ({ id: e.agent_id, i: i })) : []
                for (let i = 0; i < agentIDs.length; i++) {
                    let agent = this.agentList.find((e) => e.id === agentIDs[i].id);
                    if (agent) {
                        let index = agentIDs[i].i;
                        response.data.agents[index].agent_placeholder = agent.agent_type
                    }
                }
                for (let i = 0; i < response.data.agents?.length; i++) {
                    this.agentFArray.push(
                        this.agentForm(response.data.agents[i], false)
                    );

                }
                if (!this.agentArray.length && !this.agentFArray.length) {
                    this.addAgentForm(true);
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
    patchValues(): void {
        let upfrontBroker_commission = Number(this.prefundingData?.upfront_broker_commission).toFixed(2)
        let paybackAmount = Number(this.prefundingData?.payback_amount).toFixed(2)
        let fundingAmount = Number(this.prefundingData?.funding_amount).toFixed(2)
        let totalEarning = Number(this.prefundingData?.total_earnings).toFixed(2)
        let weeklyRemit = Number(this.prefundingData.weekly_remit).toFixed(2)

        if (String(weeklyRemit).split('.').length > 1) {
            String(weeklyRemit).split('.')[1] = '00';
            weeklyRemit = (+(weeklyRemit) + 0.0000001).toString();
        }
        this.preFundForm.patchValue({ weekly_remit: weeklyRemit });

        if (String(upfrontBroker_commission).split('.').length > 1) {
            String(upfrontBroker_commission).split('.')[1] = '00';
            upfrontBroker_commission = (+(upfrontBroker_commission) + 0.0000001).toString();
            this.preFundForm.patchValue({ upfront_broker_commission: upfrontBroker_commission })
        }
        if (String(this.prefundingData?.payback_amount).split('.').length > 1) {
            String(this.prefundingData?.payback_amount).split('.')[1] = '00';
            paybackAmount = (+(this.prefundingData?.payback_amount) + 0.0000001).toString();
            this.preFundForm.patchValue({ payback_amount: paybackAmount })
        }
        if (String(fundingAmount).split('.').length > 1) {
            String(fundingAmount).split('.')[1] = '00';
            fundingAmount = (+(this.prefundingData?.funding_amount) + 0.0000001).toString();
            this.preFundForm.patchValue({ funding_amount: fundingAmount })
        }
        if (String(totalEarning).split('.').length > 1) {
            String(totalEarning).split('.')[1] = '00';
            totalEarning = (+(totalEarning) + 0.0000001).toString();
        }
        this.preFundForm.patchValue({ total_earnings: totalEarning })

        this.preFundForm.patchValue({
            company_name: this.prefundingData?.company_name,
            // funding_date: this.prefundingData?.funding_date,
            funding_date: this.formatter.parse(this.prefundingData?.funding_date),
            // funding_date: this.formatter.parse(this.prefundingData?.funding_date.split("-").reverse().join("-")),
            funding_amount: fundingAmount,
            // funding_amount: Number(this.prefundingData?.funding_amount).toFixed(2),
            type_of_fund: this.prefundingData?.type_of_fund,
            factor_rate: this.prefundingData?.factor_rate,
            buy_rate: this.prefundingData?.buy_rate,
            // payback_amount: Number(this.prefundingData?.payback_amount).toFixed(2),
            payback_amount: paybackAmount,
            lender_id: this.prefundingData?.lender_id,
            upfront_broker_commission: upfrontBroker_commission,
            // upfront_broker_commission: Number(this.prefundingData?.upfront_broker_commission).toFixed(2),
            total_earnings: totalEarning,
            // total_earnings: this.prefundingData?.total_earnings,
            advance_type: this.prefundingData?.advance_type,
            // weekly_remit: Number(this.prefundingData?.weekly_remit).toFixed(2),
            weekly_remit: weeklyRemit,
            unit_type: this.prefundingData?.unit_type,
            term_in_weeks: this.prefundingData?.term_in_weeks,
            closer_agent_id: this.prefundingData?.closer_agent_id,
            retail_points: Number(this.prefundingData?.retail_points).toFixed(2),
            upfront_fee: this.prefundingData?.upfront_fee,
            lead_source: this.prefundingData?.lead_source,
            lead_iso:this.prefundingData?.lead_iso,
            total_points: this.prefundingData?.total_points,
            // upfront_broker_commission_on: this.prefundingData?.upfront_broker_commission_on,
            agent_commision: this.prefundingData?.agent_commision,
        })
        
        if (this.prefundingData?.type_of_fund == '') {
            setTimeout(() => {
                let data = this.preFundtype.filter((e) => e.name == 'NEW');
                if (data.length) {
                    this.preFundForm.patchValue({ type_of_fund: data[0].id });
                }

            })

        }
        // if (this.prefundingData?.upfront_broker_commission_on == '') {
        //     this.preFundForm.patchValue({ upfront_broker_commission_on: 'funding' });
        // }
        if (this.prefundingData?.agent_commision == '') {
            this.preFundForm.patchValue({ agent_commision: 'percentage' });
        }
        if (this.preFundForm.value.agent_commision == 'percentage') {
            this.checkBoxColor_agent = true;
        } else {
            this.checkBoxColor_agent = false;
        } if (this.preFundForm.value.agent_commision == 'fixed') {
            this.checkBoxColor_agent2 = true;
        } else {
            this.checkBoxColor_agent2 = false;
        }

        // if (this.preFundForm.value.upfront_broker_commission_on == 'payback') {
        //     this.checkBoxColor2 = true

        // } else {
        //     this.checkBoxColor2 = false;
        // }
        // if (this.preFundForm.value.upfront_broker_commission_on == 'funding') {
        //     this.checkBoxColor = true;
        // } else {
        //     this.checkBoxColor = false;

        // }
        // console.log( this.prefundingData?.upfront_broker_commission_on,'ghffhgfhgfhg');

        if (this.preFundAdvancetype.length) {
            let data = this.preFundForm.get('advance_type')?.value
            for (let x of this.preFundAdvancetype) {
                if (data === x?.id) {
                    const ACH = x.name;
                    this.labelRemit = ACH.replace('ACH', '');
                    if (ACH == 'Daily ACH') {
                        this.labelTerm = 'Days'
                    } else if (ACH == 'Weekly ACH') {
                        this.labelTerm = 'Weeks'
                    } else if (ACH == 'Bi-Weekly ACH') {
                        this.labelTerm = 'Bi-Weeks'

                    } else if (ACH == 'Monthly ACH') {
                        this.labelTerm = 'Months'
                    } else if (ACH == 'Variable ACH') {
                        this.labelTerm = 'Variable'
                    } else {
                        this.labelTerm = x.name;
                    }


                }
            }
        }

    }


    async submitPreFund() {
        this.preFundForm.markAllAsTouched();
        // if (this.lead?.company_type == 'broker') {
            if (this.companyType == 'broker') {
            for (let i = 0; i < this.agentFArray.length; i++) {
                this.preFundForm.get('agent_form')['controls'][i].controls.agent_id.setValidators(Validators.required);
                this.preFundForm.get('agent_form')['controls'][i].controls.agent_id.updateValueAndValidity();
                this.preFundForm.get('agent_form')['controls'][i].controls.agent_id.markAsTouched();
                this.preFundForm.get('agent_form')['controls'][i].controls.lender_commission.setValidators([Validators.pattern(Custom_Regex.amount)]);
                this.preFundForm.get('agent_form')['controls'][i].controls.lender_commission.updateValueAndValidity();
                this.preFundForm.get('agent_form')['controls'][i].controls.lender_commission.markAsTouched();
                this.preFundForm.get('agent_form')['controls'][i].controls.upfront_commission.setValidators([Validators.pattern(Custom_Regex.amount)]);
                this.preFundForm.get('agent_form')['controls'][i].controls.upfront_commission.updateValueAndValidity();
                this.preFundForm.get('agent_form')['controls'][i].controls.upfront_commission.markAsTouched();
            }
            this.preFundForm.get('agent_commision')?.setValidators([Validators.required])
            this.preFundForm.get('agent_commision')?.updateValueAndValidity();
            this.preFundForm.get('agent_commision')?.markAsTouched();

        }
        if (this.preFundForm.valid) {
            // if (this.preFundForm.value.funding_date && !Custom_Regex.date.test(this.preFundForm.value.funding_date)) {  
            //         this.commonService.showError('Invalid funding date.');
            //         this.commonService.hideSpinner();
            //         return;

            // }
            // let date: NgbDate = this.preFundForm.value.funding_date;
            // let newDate = new Date(date.year, date.month - 1, date.day);
            let exactdata = {};
            if (this.prefundingData?.funding_date == '') {
                let fundeddate = this.preFundForm.value.funding_date;
                // let date = (fundeddate.day <= 9 ? '0'+ fundeddate.day : fundeddate.day) + '-' +(fundeddate.month <= 9 ? '0'+ fundeddate.month : fundeddate.month) + '-' + fundeddate.year;
                let date = (fundeddate.month <= 9 ? '0' + fundeddate.month : fundeddate.month) + '-' + (fundeddate.day <= 9 ? '0' + fundeddate.day : fundeddate.day) + '-' + fundeddate.year;
                let data = {
                    ...this.preFundForm.value,
                    lead_id: this.leadID,
                    // funding_date: this.preFundForm.value.funding_date ? this.preFundForm.value.funding_date: "",
                    funding_date: date,
                    agent: [],
                    status: "create"

                }
                // if (this.lead?.company_type == 'broker') {
                    if (this.companyType == 'broker') {
                    for (let i = 0; i < this.preFundForm.value.agent_form.length; i++) {
                        let ins = {
                            agent_id: this.preFundForm.value.agent_form[i].agent_id,
                            lender_commission: this.preFundForm.value.agent_form[i].lender_commission,
                            upfront_commission: this.preFundForm.value.agent_form[i].upfront_commission,
                            user_type: this.preFundForm.value.agent_form[i].user_type,
                        }
                        data.agent.push(ins);
                    }
                }
                exactdata = data
            } else {


                let fundeddate = this.preFundForm.value.funding_date;
                // console.log(this.formatter.format(this.preFundForm.value.funding_date));
                // let date =  (fundeddate.day <= 9 ? '0'+ fundeddate.day : fundeddate.day) + '-' +(fundeddate.month <= 9 ? '0'+ fundeddate.month : fundeddate.month) + '-' + fundeddate.year;
                let date = (fundeddate.month <= 9 ? '0' + fundeddate.month : fundeddate.month) + '-' + (fundeddate.day <= 9 ? '0' + fundeddate.day : fundeddate.day) + '-' + fundeddate.year;

                let data = {
                    ...this.preFundForm.value,
                    lead_id: this.leadID,
                    // funding_date: this.preFundForm.value.funding_date ? this.preFundForm.value.funding_date : "",
                    funding_date: date,
                    agent: [],
                }
                // if (this.lead?.company_type == 'broker') {
                    if (this.companyType == 'broker') {
                    for (let i = 0; i < this.preFundForm.value.agent_form.length; i++) {
                        let ins = {
                            agent_id: this.preFundForm.value.agent_form[i].agent_id,
                            lender_commission: this.preFundForm.value.agent_form[i].lender_commission,
                            upfront_commission: this.preFundForm.value.agent_form[i].upfront_commission,
                            user_type: this.preFundForm.value.agent_form[i].user_type,
                        }
                        data.agent.push(ins);
                    }
                }
                exactdata = data
            }
            try {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.LEAD_PRE_FUND, exactdata, 'lead', 'pre-funding');
                let response = await lastValueFrom(res$);
                if (response.api_response == 'success') {
                    this.commonService.showSuccess(response.message)
                    this.router.navigate([`/${this.userBaseRoute}/funding-record-list/` + this.leadID]);
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
    getLeadBasicDetails(leadData: any) {
        this.lead = leadData;

    }
    async getDropdownOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.GET_PRE_FUND_DROPDOWNS, { group_name: ['pre_fund_type', 'pre_fund_advance_type', 'pre_fund_unit_type'] }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.preFundtype = response.data.pre_fund_type;
                this.preFundAdvancetype = response.data.pre_fund_advance_type;
                this.preFundUnittype = response.data.pre_fund_unit_type;

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
    async getLeadOptions() {
        try {
            let url = '';
            if (this.userRole == Roles.ADMINISTRATOR) {
                url = `?lead_id=${this.leadID}`;
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST + url, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                if (this.userDetails?.company_type == 'broker') {
                    this.leadSourceList = response.data.lead_source;
                } else {
                    this.leadSourceList = response.data.iso;
                }
                this.isoList =  response.data.iso
                this.leadSourceList.sort((a, b) => a.name.localeCompare(b.name))
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
    fundingAmount(value: any) {
        let FundingAmount = this.preFundForm.value.funding_amount.toFixed(2)
        if (FundingAmount.split('.').length > 1) {
            FundingAmount.split('.')[1] = '00';
            FundingAmount = (+(FundingAmount) + 0.0000001).toString();
        }
        this.preFundForm.patchValue({ funding_amount: FundingAmount })
        let total_value: any = 0;
        total_value = (Number(this.preFundForm.value.funding_amount)) * (Number(this.preFundForm.value.factor_rate));
        total_value.toFixed(2)
        if (String(total_value).split('.').length > 1) {
            String(total_value).split('.')[1] = '00';
            total_value = (+(total_value) + 0.0000001).toString();
        }
        this.preFundForm.patchValue({ payback_amount: total_value });
        let daily_payment = 0;
        daily_payment = (Number(this.preFundForm.value.payback_amount)) / (Number(this.preFundForm.value.term_in_weeks));
        if(daily_payment){

            this.preFundForm.patchValue({ weekly_remit: daily_payment.toFixed(2) });
        }else{
            this.preFundForm.patchValue({ weekly_remit: 0 });

        }        
        // funding Amount format

        let total_upfront_broker_commission: any = 0;
        total_upfront_broker_commission = (Number(this.preFundForm.value.factor_rate) - Number(this.preFundForm.value.buy_rate)) * Number(this.preFundForm.value.funding_amount);
        total_upfront_broker_commission.toFixed(2)
        if (String(total_upfront_broker_commission).split('.').length > 1) {
            String(total_upfront_broker_commission).split('.')[1] = '00';
            total_upfront_broker_commission = (+(total_upfront_broker_commission) + 0.0000001).toString();
        }
        this.preFundForm.patchValue({ upfront_broker_commission: total_upfront_broker_commission });
        let total_earning: any = 0;
        total_earning = (Number(this.preFundForm.value.upfront_fee) + Number(this.preFundForm.value.upfront_broker_commission));
        total_earning.toFixed(2)
        if (String(total_earning).split('.').length > 1) {
            String(total_earning).split('.')[1] = '00';
            total_earning = (+(total_earning) + 0.0000001).toString();
        }
        this.preFundForm.patchValue({ total_earnings: total_earning })


    }
    termInDays(value: any) {
        let daily_payment: any = 0;
        daily_payment = (Number(this.preFundForm.value.payback_amount)) / (Number(this.preFundForm.value.term_in_weeks));
        daily_payment.toFixed(2)
        if (String(daily_payment).split('.').length > 1) {
            String(daily_payment).split('.')[1] = '00';
            daily_payment = (+(daily_payment) + 0.0000001).toString();
        }
        this.preFundForm.patchValue({ weekly_remit: daily_payment });
    }
    changeFactorRate(value: any) {
        if (Number(this.preFundForm.value.factor_rate) > 100) {
            this.commonService.showError("Please enter value less than or equal to 100")
            this.preFundForm.patchValue({ factor_rate: '' })
        } else if (Number(this.preFundForm.value.factor_rate) < Number(this.preFundForm.value.buy_rate)) {
            this.commonService.showError("Factor rate can't be less than buy rate")
            this.preFundForm.patchValue({ factor_rate: '' })
        } else {
            let total_upfront_broker_commission: any = 0;
            total_upfront_broker_commission = (Number(this.preFundForm.value.factor_rate) - Number(this.preFundForm.value.buy_rate)) * Number(this.preFundForm.value.funding_amount);
            total_upfront_broker_commission.toFixed(2)
            if (String(total_upfront_broker_commission).split('.').length > 1) {
                String(total_upfront_broker_commission).split('.')[1] = '00';
                total_upfront_broker_commission = (+(total_upfront_broker_commission) + 0.0000001).toString();
            }
            this.preFundForm.patchValue({ upfront_broker_commission: total_upfront_broker_commission });
            let total_earning: any = 0;
            total_earning = (Number(this.preFundForm.value.upfront_fee) + Number(this.preFundForm.value.upfront_broker_commission));
            total_earning.toFixed(2)
            if (String(total_earning).split('.').length > 1) {
                String(total_earning).split('.')[1] = '00';
                total_earning = (+(total_earning) + 0.0000001).toString();
            }
            this.preFundForm.patchValue({ total_earnings: total_earning })
            // this.preFundForm.patchValue({ total_earnings: total_upfront_broker_commission })
            let total_payback_amount: any = 0;
            total_payback_amount = Number(this.preFundForm.value.funding_amount) * Number(this.preFundForm.value.factor_rate);
            total_payback_amount.toFixed(2)
            if (String(total_payback_amount).split('.').length > 1) {
                String(total_payback_amount).split('.')[1] = '00';
                total_payback_amount = (+(total_payback_amount) + 0.0000001).toString();
            }
            this.preFundForm.patchValue({ payback_amount: total_payback_amount });
            let total_points = 0;
            total_points = (Number(this.preFundForm.value.factor_rate) - Number(this.preFundForm.value.buy_rate)) * 100;
            this.preFundForm.patchValue({ total_points: total_points.toFixed(2) })
            this.preFundForm.patchValue({ retail_points: total_points.toFixed(2) });

            let daily_payment = 0;
            daily_payment = (Number(this.preFundForm.value.payback_amount)) / (Number(this.preFundForm.value.term_in_weeks));
            this.preFundForm.patchValue({ weekly_remit: daily_payment.toFixed(2) });

        }
    }
    buyrate(value: any,isFromPoint:boolean) {
        if (Number(this.preFundForm.value.buy_rate) > 100) {
            this.commonService.showError("Please enter value less than or equal to 100")
            this.preFundForm.patchValue({ buy_rate: '' })
        } else if (Number(this.preFundForm.value.buy_rate) > Number(this.preFundForm.value.factor_rate)) {
            this.commonService.showError("Buy rate can't be greater than factor rate")
            this.preFundForm.patchValue({ buy_rate: '' })
        } else {
            let total_upfront_broker_commission: any = 0;
            total_upfront_broker_commission = (Number(this.preFundForm.value.factor_rate) - Number(this.preFundForm.value.buy_rate)) * Number(this.preFundForm.value.funding_amount);
            total_upfront_broker_commission.toFixed(2)
            // console.log(  total_upfront_broker_commission.toFixed(2));

            if (String(total_upfront_broker_commission).split('.').length > 1) {
                // console.log(  total_upfront_broker_commission.toFixed(2));

                String(total_upfront_broker_commission).split('.')[1] = '00';
                total_upfront_broker_commission = (+(total_upfront_broker_commission) + 0.0000001).toString();
            }
            this.preFundForm.patchValue({ upfront_broker_commission: total_upfront_broker_commission });
            let total_earning: any = 0;
            total_earning = (Number(this.preFundForm.value.upfront_fee) + Number(this.preFundForm.value.upfront_broker_commission));
            total_earning.toFixed(2)
            if (String(total_earning).split('.').length > 1) {
                String(total_earning).split('.')[1] = '00';
                total_earning = (+(total_earning) + 0.0000001).toString();
            }
            this.preFundForm.patchValue({ total_earnings: total_earning })
            // this.preFundForm.patchValue({ total_earnings: total_upfront_broker_commission })
            if(!isFromPoint){
                let total_points:any = 0;
                total_points = (Number(this.preFundForm.value.factor_rate) - Number(this.preFundForm.value.buy_rate));
                // console.log('Number(this.preFundForm.value.factor_rate)',Number(this.preFundForm.value.factor_rate));
                // console.log('Number(this.preFundForm.value.buy_rate)',Number(this.preFundForm.value.buy_rate));
                // console.log('total_points',(Number(this.preFundForm.value.factor_rate) - Number(this.preFundForm.value.buy_rate)));
                total_points = (total_points) * 100;
                let totalDEcimlPoint = String(Number(this.preFundForm.value.buy_rate)).split('.')[1]?.length?String(Number(this.preFundForm.value.buy_rate)).split('.')[1]?.length:2;                
                this.preFundForm.patchValue({ total_points: total_points.toFixed(totalDEcimlPoint) })
                this.preFundForm.patchValue({ retail_points:Number( total_points).toFixed(2) })
            }

        }

    }

    getTotalPoints() {
        let pointsValue = (Number(this.preFundForm.value.total_points)) / 100
        let pointDecimal = String(Number(this.preFundForm.value.total_points)).split('.')[1]?.length;
        if(!pointDecimal){
            pointDecimal = 1
        }

        let buyRate = (this.preFundForm.value.factor_rate - pointsValue);
        // console.log('buyRate',buyRate,'pointDecimal',pointDecimal);
        
        if(buyRate){
            this.preFundForm.patchValue({ buy_rate: buyRate.toFixed(pointDecimal + 1) })
            this.buyrate(buyRate,true);
        }else{
            this.preFundForm.patchValue({ buy_rate: 0 })
            this.buyrate(0,true);
        }
    }
    
    async getAgentDropdownList(): Promise<any> {
        try {
            let url = `?page_limit=${this.agentListLimit}&page=${this.agentListPage}&lead_id=${this.leadID}`;

            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_AGENT_LIST + url, 'lead', 'fund-record');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.agentList = response.data.data;
                
                this.getPreFunding();
            } else {
                this.agentList = [];
                this.agentListPage = 1;
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
    onChange(e: any) {
        // let data =   this.preFundForm.get('upfront_broker_commission_on').value;
        let data = e.target.value;
        if (data == 'funding') {
            this.checkBoxColor = true;
        } else {

            this.checkBoxColor = false;
        }
        if (data == 'payback') {
            this.checkBoxColor2 = true
        } else {
            this.checkBoxColor2 = false

        }


    }
    onChangeAgent(e: any) {
        let data = e.target.value;

        if (data == 'percentage') {
            this.checkBoxColor_agent = true;
        } else {
            this.checkBoxColor_agent = false;
        } if (data == 'fixed') {
            this.checkBoxColor_agent2 = true;
        } else {
            this.checkBoxColor_agent2 = false;
        }

        for (let i = 0; i < this.agentFArray.length; i++) {
                this.agentFArray.controls[i].patchValue({upfront_commission:0})
                this.agentFArray.controls[i].patchValue({lender_commission:0})
        }
    }
    calculatetotalEarings() {
        let total_earning: any = 0;
        total_earning = (Number(this.preFundForm.value.upfront_fee) + Number(this.preFundForm.value.upfront_broker_commission));
        total_earning.toFixed(2)
        if (String(total_earning).split('.').length > 1) {
            String(total_earning).split('.')[1] = '00';
            total_earning = (+(total_earning) + 0.0000001).toString();
        }
        this.preFundForm.patchValue({ total_earnings: total_earning });

        if(!this.preFundForm.value.upfront_fee){
            for (let i = 0; i < this.agentFArray.length; i++) {
                    this.agentFArray.controls[i].patchValue({upfront_commission:0}) 
                }
            }
    }
    disabledAgent(id: any) {
        const agents: string[] = this.preFundForm.value.agent_form.map((e: any) => e.agent_id);
        const i = agents.findIndex(e => e === id);
        if (i > -1) {
            return true;
        }
        return false;
    }

    //get desired percentage
    showCommionPerctng(lender_commission: any,placeholderCheck:any){
        if(placeholderCheck == 'Assigned ISO'){
        //  return 0
        }else if(placeholderCheck != 'Assigned ISO'){
           let getCommission =(Number(lender_commission) * 100) / Number(this.preFundForm.value.upfront_broker_commission);
           if(getCommission){
               return (getCommission).toFixed(2);
           }
        }
        return 0
    }
    // , upfront_commission: any
    getamount(lender_commission: any,placeholderCheck:any) {
        this.onRetailPointChange();
        let upfrontBrokerCommission =Number(this.preFundForm.value.upfront_broker_commission) - Number(this.updatedUpfrontCommission) 
        let value = 0;
       if(placeholderCheck == 'Assigned ISO'){
        let AssigendISOvalye = Number(this.updatedUpfrontCommission);
        return AssigendISOvalye
       } else if (placeholderCheck != 'Assigned ISO'){
        if(this.preFundForm.value.agent_commision === 'percentage'){

        // if (this.preFundForm.value.upfront_broker_commission) {
            value = Number(upfrontBrokerCommission) * (Number(lender_commission) / 100);
            // return '$' + value.toFixed(2)

            return value
        }else{
            value =Number(lender_commission);
            // return '$' + value.toFixed(2)
            return value

        }
        } else {
            return ''
        }
        }
    getUpfront(upfront_fee:any){
        let value = 0;
        if (this.preFundForm.value.upfront_fee) {
            if(this.preFundForm.value.agent_commision === 'percentage'){
                value = Number(this.preFundForm.value.upfront_fee) * (Number(upfront_fee) / 100);
                // return '$' + value.toFixed(2)
                
                return value
            }else{
                value = Number(upfront_fee);
                return value
            }

        } else {
            return '';
        }
            
    }
    //
    getUpfrontPercentag(upfront_fee:any){
        try{
            if (this.preFundForm.value.upfront_fee) {
              let upfrontCommison = (Number(upfront_fee)*100)/this.preFundForm.value.upfront_fee;
              if(upfrontCommison){
                  return upfrontCommison.toFixed(2);
              }
            } 
            return 0
        }catch(e){
       return 0
        }

    }
    getDecimal(val: any) {
        return Number(val).toFixed(2)
    }
   
    getAdvanceType() {
        if (this.preFundAdvancetype.length) {
            let data = this.preFundForm.get('advance_type')?.value
            for (let x of this.preFundAdvancetype) {
                if (data === x?.id) {
                    return x.name
                }
            }
        }
    }
    getUnitType() {
        if (this.preFundUnittype.length) {
            let data = this.preFundForm.get('unit_type')?.value
            for (let x of this.preFundUnittype) {
                if (data === x?.id) {
                    return x.name
                }
            }
        }

    }
    getIso() {
        if (this.leadSourceList.length) {
            let data = this.preFundForm.get('lead_source')?.value
            for (let x of this.leadSourceList) {
                if (data === x?.id) {
                    return x.name
                }
            }
        }

    }
    getFundeddate() {
        if (this.preFundForm.value.funding_date) {
            let fundeddate = this.preFundForm.value.funding_date;
            let date = (fundeddate.month <= 9 ? '0' + fundeddate.month : fundeddate.month) + '-' + (fundeddate.day <= 9 ? '0' + fundeddate.day : fundeddate.day) + '-' + fundeddate.year;
            return date
        } else {
            return ''
        }

    }
    gettypeOfFund() {
        if (this.preFundtype.length) {
            let data = this.preFundForm.get('type_of_fund')?.value
            for (let x of this.preFundtype) {
                if (data === x?.id) {
                    return x.name
                }
            }
        }

    }
    get agentArrayForm() {
        return this.agentFArray.controls[this.agentIndex] as FormGroup;
    }

    changeAgentData(i: any) {
        this.agentIndex = i;
        let agent = this.agentList.find((e) => e.id === this.agentFArray.value[i].agent_id);
        if (agent) {
            this.agentArrayForm.patchValue({
                agent_placeholder: agent.agent_type
            });

        }
    }
    getAgentName(id: string) {
        if (this.agentList.length) {
            let data = id
            for (let x of this.agentList) {
                if (data === x?.id) {
                    let agentType = '(' + x.agent_type + ')';
                    // return x.name +' '+ agentType;
                    return x.name;
                    // return  `${x.name}${agentType}`;
                }
                // + '(' + x.agent_type + ')'
            }
        }
    }

    // getTotalLenderAu(lenderAu:any,UpfrontAu:any){
    //     this.getFundValue();
    //       return Number(lenderAu) + Number(UpfrontAu)
    // }
    getTotalLenderAu(lenderAu:any,UpfrontAu:any){
        this.getFundValue();
        // console.log('lenderAu',lenderAu);
        // console.log('UpfrontAu',UpfrontAu);
        
          return Number(lenderAu)+ Number(UpfrontAu)
    }
    // getFundValue(){
    //     this.onRetailPointChange();
    //     let lenderCommission = 0;
    //     let UpFrontCommission = 0;
    //     let upCommission =  Number(this.preFundForm.value.upfront_broker_commission) - Number(this.updatedUpfrontCommission);
    //     let upFrontFee  = Number(this.preFundForm.value.upfront_fee);
    //     for( let agent of this.agentFArray.controls){
    //     lenderCommission += Number(upCommission) * agent.get('lender_commission')?.value/100;
    //     UpFrontCommission += Number(upFrontFee) * agent.get('upfront_commission')?.value/100;
    //         //   lenderCommission += Number(this.preFundForm.value.upfront_broker_commission) * agent.get('lender_commission')?.value/100;
    //         //   UpFrontCommission += Number(this.preFundForm.value.upfront_broker_commission) * agent.get('upfront_commission')?.value/100;
    //    }
    //    this.totalCommission = lenderCommission + UpFrontCommission 
    // }

    getFundValue(){
        this.onRetailPointChange();
        let lenderCommission = 0;
        let UpFrontCommission = 0;
        let upCommission =  Number(this.preFundForm.value.upfront_broker_commission) - Number(this.updatedUpfrontCommission);
        let upFrontFee  = Number(this.preFundForm.value.upfront_fee);
        let assignedISOcommission = 0;
        for( let agent of this.agentFArray.controls){
            if(agent.get('agent_placeholder')?.value == 'Assigned ISO'){
                assignedISOcommission = Number(this.updatedUpfrontCommission);
               
              }else if(agent.get('agent_placeholder')?.value != 'Assigned ISO'){
                if(this.preFundForm.value.agent_commision === 'percentage'){

                    lenderCommission += Number(upCommission) * agent.get('lender_commission')?.value/100;
                    UpFrontCommission += Number(upFrontFee) * agent.get('upfront_commission')?.value/100;
                }else{
                    lenderCommission += Number(agent.get('lender_commission')?.value) ;
                    UpFrontCommission += Number(agent.get('upfront_commission')?.value) ;

                }
              

              }

       }              
       this.totalCommission = lenderCommission + UpFrontCommission + assignedISOcommission
    }
//    get houseNetProfit(){
//         this.onRetailPointChange();
//         //  let upBorkerCom = Number(this.preFundForm.value.upfront_broker_commission);
//         let upBorkerCom = Number(this.preFundForm.value.upfront_broker_commission) - Number(this.updatedUpfrontCommission);
//         let upFrontfee = Number(this.preFundForm.value.upfront_fee);
//         let   netProfit = ( (upBorkerCom + upFrontfee ) - this.totalCommission);
//         return netProfit ;
//     }
    get houseNetProfit(){
        this.onRetailPointChange();
         let earlierUpBorkerCom = Number(this.preFundForm.value.upfront_broker_commission);
        let upBorkerCom = Number(this.preFundForm.value.upfront_broker_commission) - Number(this.updatedUpfrontCommission);
        let upFrontfee = Number(this.preFundForm.value.upfront_fee);
        let   netProfit = ( (earlierUpBorkerCom + upFrontfee ) - this.totalCommission);
        // console.log('this.totalCommission',this.totalCommission);
        // console.log('this.earlierUpBorkerCom',earlierUpBorkerCom);
        // console.log('this.upfront',upFrontfee);
        
        return netProfit ;
    }
   

    onRetailPointChange(){
        // let upBorkerCom = Number(this.preFundForm.value.upfront_broker_commission);
        let fundingAmount = Number(this.preFundForm.value.funding_amount);
        let total_points = Number(this.preFundForm.value.total_points);
        let retail_points = Number(this.preFundForm.value.retail_points);
        let differencePoint = total_points - retail_points;
        this.updatedUpfrontCommission = fundingAmount*(differencePoint/100);
        // let percentageValueISo = upBorkerCom*(differencePoint/100)
        // console.log('fundig-Amount:-',fundingAmount);
        
        for (let i = 0; i < this.agentFArray.length; i++) {

            if(this.agentFArray.controls[i].value.agent_placeholder == 'Assigned ISO' ){
                this.agentFArray.controls[i].patchValue({lender_commission:differencePoint.toFixed(2)})
                this.agentFArray.controls[i].patchValue({upfront_commission:0})
                // this.agentArrayForm.patchValue({
                //     lender_commission: differencePoint,
                //     upfront_commission:0
                //         });

            }

        }
        
    }
     
    ngAfterContentChecked() {
        this.cdr.detectChanges();
    }
    //getISO list
    async getISOList() {
        try {
            let url = '';
            // if (this.userRole == Roles.ADMINISTRATOR) {
            //     url = `?company_id=${this.companyID}`;
            // }
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_OPTIONS_LIST + url, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                    this.lenderList = response.data.iso;
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

