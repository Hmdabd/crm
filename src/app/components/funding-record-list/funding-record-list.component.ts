import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-funding-record-list',
    templateUrl: './funding-record-list.component.html',
    styleUrls: ['./funding-record-list.component.scss', '../../styles/dashboard.scss',]
})
export class FundingRecordListComponent implements OnInit {
    lead: any = {};
    leadID: string = '';
    updatesList: Array<any> = [];
    updatepage: number = 1;
    limit: number = 10;
    total: number = 0;
    dateFormat: string = '';
    timeZone: string = '';
    companyType: string = ''
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    prefundingData: any = {};
    agentArray: Array<any> = [];
    labelRemit: string = 'Weekly'
    labelTerm: string = 'Weeks'
    payrollToFunding: boolean = false;
    totalCommission: any = 0;
    brokerCommissionUpdated: any = 0;
    // companyType:string = ''
    constructor(private commonService: CommonService,
        private route: ActivatedRoute,
        private authService: AuthService,
        private apiService: ApiService) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLeadUpdates();
        } else {
            this.commonService.showError('');
        }
        this.getUserDetails();
        this.getPreFunding();
        this.route.queryParams.subscribe(params => {
            if (params['payroll'] && this.companyType == 'broker') {
                this.payrollToFunding = params['payroll'];
            }
        });
    }
    ngDoCheck(): void {

        this.getPaginationList();
    }
    getPaginationList() {

        let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
        for (let i = 0; i < data?.length; i++) {
            if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                data[i].style.background = this.color;
            } else {
                data[i].style.background = 'none';

            }
        }

    }

    /**
     * @description get lead updatessss
     */

    async getLeadUpdates() {
        try {
            let url = `?page_limit=${this.limit}&page=${this.updatepage}&id=${this.leadID}`;
            this.commonService.showSpinner();
            let res$ = this.apiService.getReq(API_PATH.GET_FUNDING_RECORDS + url, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data.data) {
                    this.updatesList = response.data.data;
                    this.total = response.data.total
                } else {
                    this.updatesList = [];
                    this.total = 0;
                    this.updatepage = 1;
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
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
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
    getDate(date: any) {
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }
    GetDate(date: any) {
        return moment(date).format(`${this.dateFormat}`)

    }
    getLeadBasicDetails(leadData: any) {
        this.lead = leadData;

    }
    /**
       * @description on page change
       * @returns {void}
       * @param p 
       */
    onPageChange(p: number): void {
        this.updatepage = p;
        this.getLeadUpdates();
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    // getamount(lender_commission: any, upfront_commission: any) {
    //     let value = 0;
    //     if (upfront_commission) {
    //         value = Number(upfront_commission) * (Number(lender_commission) / 100);
    //         // let dollarIndianLocale = Intl.NumberFormat('en-IN'); comma seprator
    //         // return '$' + value.toFixed(2)
    //         return value
    //     } else {
    //         return '';
    //     }

    // }
    // getamount(lender_commission: any, upfront_commission: any) {
    //     this.getNetProfit();
    //     let value = 0;
    //     if (this.brokerCommissionUpdated) {
    //         value = Number(this.brokerCommissionUpdated) * (Number(lender_commission) / 100);
    //         // let dollarIndianLocale = Intl.NumberFormat('en-IN'); comma seprator
    //         // return '$' + value.toFixed(2)
    //         return value
    //     } else {
    //         return '';
    //     }

    // }
    getFrontCommission(upfrontfee: any) {
        let upfrontFee = Number(this.prefundingData?.upfront_fee);
        let value = 0;
        if (upfrontFee) {
            value = Number(upfrontFee) * (Number(upfrontfee) / 100);
            // let dollarIndianLocale = Intl.NumberFormat('en-IN'); comma seprator
            // return '$' + value.toFixed(2)
            return value
        } else {
            return '';
        }
    }
    async deletePrefund(id: any): Promise<void> {
        try {
            let url = `?&id=${id}`;
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.DELETE_PREFUND_LIST + url, 'lender', 'offer-delete');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.commonService.showSuccess(response.message);
                this.updatesList = this.updatesList.filter(el => !id.includes(el.id));
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
    getTotalamountCommission(value1: any, value2: any) {
        let value = 0;
        if (value1 || value2) {
            value = value1 + value2
            return value
        } else {
            return '';
        }
    }
    getTotalpercentageCommission(value1: any, value2: any) {
        let value = 0;
        if (value1 || value2) {
            value = Number(value1) + Number(value2)
            return '(' + value + ')' + '%'
        } else {
            return '';
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
                this.labelRemit = this.prefundingData?.advance_type_name.replace('ACH', '');
                if (this.prefundingData?.advance_type_name == 'Daily ACH') {
                    this.labelTerm = 'Days'
                } else if (this.prefundingData?.advance_type_name == 'Weekly ACH') {
                    this.labelTerm = 'Weeks'
                } else if (this.prefundingData?.advance_type_name == 'Bi-Weekly ACH') {
                    this.labelTerm = 'Bi-Weeks'

                } else if (this.prefundingData?.advance_type_name == 'Monthly ACH') {
                    this.labelTerm = 'Months'
                } else if (this.prefundingData?.advance_type_name == 'Variable ACH') {
                    this.labelTerm = 'Variable'
                } else {
                    this.labelTerm = this.prefundingData?.advance_type_name;
                }
                // this.agentList.push(this.prefundingData?.assigned_user);
                // this.patchValues();
                this.agentArray = response.data.agents;
                // for (let i = 0; i < response.data.agents?.length; i++) {
                //     this.agentFArray.push(
                //         this.agentForm(response.data.agents[i], false)
                //     );
                // }
                // if (!this.agentArray.length && !this.agentFArray.length) {
                //     this.addAgentForm(true);
                // }
                this.getCommissionVal()

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
    getDecimal(val: any) {
        return Number(val).toFixed(2)
    }
    //     getTotalLenderAu(lenderAu:any,UpfrontAu:any){
    //         return Number(lenderAu) + Number(UpfrontAu)
    //   }
    //   getCommissionVal(){
    //     this.getNetProfit();
    //     let lenderCommValue = 0;
    //     let upFrontCommValue = 0
    //     // let upfrontBrokerCommission =  Number(this.prefundingData?.upfront_broker_commission) - (Number(this.prefundingData?.upfront_broker_commission)*diffrence/100);
    //     for(let agent of this.prefundingData?.agents){
    //         lenderCommValue += this.brokerCommissionUpdated  * agent.lender_commission / 100;
    //         upFrontCommValue +=  Number(this.prefundingData?.upfront_fee) * agent.upfront_commission / 100;
    //     }
    //     this.totalCommission = lenderCommValue + upFrontCommValue ;
    //   }
    //   getNetProfit(){
    //     let diffrence = 0;
    //     diffrence = Number(this.prefundingData?.total_points) - Number(this.prefundingData?.retail_points);
    //     // let upfrontBroker = Number(this.prefundingData?.upfront_broker_commission)
    //     // let UpfrontFee = Number(this.prefundingData?.upfront_fee);
    //     // let netProfit = ((upfrontBroker + UpfrontFee) - this.totalCommission);
    //     // console.log(Number(this.prefundingData?.funding_amount),'hfkhgfgh');

    //     let upfrontBroker = Number(this.prefundingData?.upfront_broker_commission) - (Number(this.prefundingData?.funding_amount)*diffrence/100);
    //     this.brokerCommissionUpdated = upfrontBroker;
    //     let UpfrontFee = Number(this.prefundingData?.upfront_fee);
    //     let netProfit = ((upfrontBroker + UpfrontFee) - this.totalCommission);
    //     return netProfit;
    //   }
    getTotalLenderAu(lenderAu: any, UpfrontAu: any) {
        return Number(lenderAu) + Number(UpfrontAu);
    }
    getCommissionVal() {
        this.getNetProfit();
        let lenderCommValue = 0;
        let upFrontCommValue = 0
        let assignedISOcommission = 0;
        // let upfrontBrokerCommission =  Number(this.prefundingData?.upfront_broker_commission) - (Number(this.prefundingData?.upfront_broker_commission)*diffrence/100);
        for (let agent of this.prefundingData?.agents) {
            if (agent.agent_type == 'Assigned ISO') {
                assignedISOcommission = (Number(this.prefundingData?.funding_amount) / 100) * agent.lender_commission
            } else if (agent.agent_type != 'Assigned ISO') {
                if (this.prefundingData?.agent_commision === 'percentage') {
                    lenderCommValue += this.brokerCommissionUpdated * agent.lender_commission / 100;
                    upFrontCommValue += Number(this.prefundingData?.upfront_fee) * agent.upfront_commission / 100;
                } else {
                    lenderCommValue += Number(agent.lender_commission);
                    upFrontCommValue += Number(agent.upfront_commission);
                }

            }
        }

        this.totalCommission = lenderCommValue + upFrontCommValue + assignedISOcommission;
    }
    getNetProfit() {
        let diffrence = 0;
        diffrence = Number(this.prefundingData?.total_points) - Number(this.prefundingData?.retail_points);
        let earlierupfrontBroker = Number(this.prefundingData?.upfront_broker_commission)
        let upfrontBroker = Number(this.prefundingData?.upfront_broker_commission) - (Number(this.prefundingData?.funding_amount) * diffrence / 100);
        this.brokerCommissionUpdated = upfrontBroker;
        let UpfrontFee = Number(this.prefundingData?.upfront_fee);
        let netProfit = ((earlierupfrontBroker + UpfrontFee) - this.totalCommission);
        return netProfit;
    }
    getamount(lender_commission: any, upfront_commission: any, placeholderCheck: any) {
        this.getNetProfit();
        let value = 0;
        let assiged_Iso = 0;
        if (placeholderCheck == 'Assigned ISO') {
            assiged_Iso = (Number(this.prefundingData?.funding_amount) / 100) * lender_commission;
            return assiged_Iso;
        }
        else if (placeholderCheck != 'Assigned ISO') {
            if (this.prefundingData?.agent_commision === 'percentage') {
                value = Number(this.brokerCommissionUpdated) * (Number(lender_commission) / 100);
                // let dollarIndianLocale = Intl.NumberFormat('en-IN'); comma seprator
                // return '$' + value.toFixed(2)
                return value
            } else {
                return Number(lender_commission).toFixed(2)
            }
        } else {
            return '';
        }


    }
    getTotalUpfrontFee(upfront: any, upfront_fee: any, place: any) {
        let upFrontFee = Number(this.prefundingData?.upfront_fee);
        if (this.prefundingData?.agent_commision === 'percentage') {

            let totalUpFrontFee = upFrontFee * (upfront / 100);
            return totalUpFrontFee;
        } else {
            return Number(upfront);
        }
    }
    totalCommissionPartners(totalLender: any, totalUpfront: any) {
        if (totalLender || totalUpfront) {
            return (Number(totalLender) + Number(totalUpfront))
        } else {
            return ''
        }

    }
    getLenderPercenatge(lenderCommission: any) {
        if (this.prefundingData?.agent_commision === 'percentage') {
            if(lenderCommission){
                return lenderCommission
            }
        } else{

            if (lenderCommission) {
                let value = (Number(lenderCommission) * 100) / Number(this.prefundingData?.upfront_broker_commission);
                return (value).toFixed(2)
            } else {
                return 0
            }
        }
    }
    getUpfrontPercenatge(upfront: any) {
        if (this.prefundingData?.agent_commision === 'percentage') {
            if(upfront){
                return upfront
            }
        }else{

            if (upfront) {
                let value = (Number(upfront) * 100) / Number(this.prefundingData?.upfront_fee);
                if(value){
                    return (value).toFixed(2)
                }else{
                    return 0
                }
            } else {
                return 0
            }
        }

    }
    showCommionPerctng(lender_commission: any,placeholderCheck:any){
        if(placeholderCheck == 'Assigned ISO'){
        //  return 0
        }else{
           let getCommission =(Number(lender_commission) * 100) / Number(this.prefundingData.upfront_broker_commission);
           if(getCommission){
               return (getCommission).toFixed(2);
           }
        }
      return 0
    }
    getUpfrontPercentag(upfront_fee:any){
        try{
            if (this.prefundingData.upfront_fee) {
              let upfrontCommison = (Number(upfront_fee)*100)/this.prefundingData.upfront_fee;
              if(upfrontCommison){
                  return upfrontCommison.toFixed(2);
              }
            } 
            return 0
        }catch(e){
       return 0
        }

    }
}
