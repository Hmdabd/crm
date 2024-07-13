import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import moment from 'moment';
import { ExcelService } from '@services/excel.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-fund-details',
    templateUrl: './fund-details.component.html',
    styleUrls: ['./fund-details.component.scss']
})
export class FundDetailsComponent implements OnInit {
    leadID: string = '';
    totalRemainingFundingAmount: number = 0;
    fundDetails: any;
    fundDetailForm!: FormGroup | any;
    syndicateList: Array<any> = [];
    partcipantList: Array<any> = [];
    participantid: string = '';
    selectedParticipantID: string = '';
    selectedParticipant: any = {};
    lead: any = {};
    dateFormat: string = '';
    timeZone: string = '';
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    participantIndex: any = 0
    sell_Rate: number = 0;
    sumOfParticipantAmount = 0;
    participantTotalAmount: number = 0;
    actualParticipantAmount: number = 0;
    leadNotesList: Array<any> = [];
    total = 0;
    participantLogPage2: number = 1;
    limit: number = 10;
    color: any;
    tabView: boolean = true;
    sendSpecForm!: FormGroup;
    documentsList: Array<any> = [];
    page: number = 1
    hasMoreDocs: boolean = false;
    loading: boolean = false;
    individual_id: any = [];
    participant_amount_check: boolean = false;
    participantIdArray: Array<any> = [];
    participantSpecList: Array<any> = [];
    documentIdArray: Array<any> = [];
    ActiveParticipantList: Array<any> = [];
    hasMoreUsers: boolean = false;
    usersListLimit: number = 10;
    totalUsersCount: number = 0;
    userListPage: number = 1;
    termLables: string = 'Days';
    userDetails: any = {};
    companyType: string = '';
    specParticipantListing: Array<any> = [];
    searchOrder = {
        order: 'DESC',
        sortby: 'created_at'
    }
    canDeleteDoc: boolean = false;
    canDownloadDoc: boolean = false;
    canShareDoc: boolean = false;
    canViewDoc: boolean = false;
    canUploadDoc: boolean = false;
    canRenameDoc: boolean = false;
    documentListing: Array<any> = [];
    modal!: NgbModalRef;
    documentDetails: any = {};
    listTotal:number = 0;
    participantNotes:string=''
    constructor(
        private route: ActivatedRoute,
        private commonService: CommonService,
        private apiService: ApiService,
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private cdref: ChangeDetectorRef,
        private excelService: ExcelService,
        private modalService: NgbModal,

    ) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getFundingList();
            this.getspecParticipantList();
        } else {
            this.commonService.showError('');
        }
        this.initfundDetailForm();
        this.getUserDetails();
        this.getLeadNotes();
        this.initsendSpecForm();
        this.getLeadDocuments();
        this.getDocumentsList();
        // this.getSyndicatesList();
        this.getPaginationList();
        this.canDeleteDoc = this.authService.hasPermission('lead-document-delete');
        this.canDownloadDoc = this.authService.hasPermission('lead-document-download');
        this.canShareDoc = this.authService.hasPermission('document-share');
        this.canViewDoc = this.authService.hasPermission('lead-document-view');
        this.canUploadDoc = this.authService.hasPermission('lead-document-upload');
        this.canRenameDoc = this.authService.hasPermission('lead-document-rename');
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
                this.companyType = ud?.company_type;
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.getColorOnUpdate();
                this.style = { fill: ud?.color };
                this.color = ud?.color;
                // this.stroke={stroke:ud?.color};

                this.background = { background: ud?.color };

            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    ngAfterContentChecked() {

        this.cdref.detectChanges();

    }

    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }

    initfundDetailForm(): void {
        this.fundDetailForm = this.fb.group({
            participant_form: this.fb.array([]),
        });
        //  this.addParticipantForm(true);
    }

    get f(): { [key: string]: AbstractControl } {
        return this.fundDetailForm.controls;
    }
    get participantFaArray() {
        return this.fundDetailForm.get('participant_form') as FormArray;
    }
    get participantsForm() {
        return this.fundDetailForm.get('participant_form').controls[this.participantIndex] as FormGroup;
        // return this.bankFArray.controls[0]?.get('adjustment') as FormGroup;     
    }

    onAddButtonClick() {  
        if (this.selectedParticipantID) {
            // this.syndicateList.map((m:any)=>{console.log(m.purchase_price = Number(m.management_fee)  + Number(m.syndication_fee))})
            this.selectedParticipant = this.syndicateList.find((e) => e.id == this.selectedParticipantID);
            this.selectedParticipant.selected = 1;
            this.participantFaArray.push(this.participantForm(this.selectedParticipant));
            let index = this.syndicateList.findIndex((e) => e.id === this.selectedParticipantID);
            if (index > -1) {
                this.syndicateList[index].selected = 1;
            }
            this.selectedParticipantID = '';

        } else {
            this.commonService.showError('Please select participant first')
        }
    }


    participantForm(data: any) {
        return this.fb.group({
            // syndicate_name: [this.selectedParticipant.name],
            // syndicator_id: [this.selectedParticipant.id, [Validators.pattern(Custom_Regex.spaces)]],
            // management_fee: [this.selectedParticipant.management_fee ? this.selectedParticipant.management_fee : 0, [Validators.pattern(Custom_Regex.amount)]],
            // participant_amount: [this.selectedParticipant.participant_amount ? this.selectedParticipant.participant_amount : 0, [Validators.pattern(Custom_Regex.amount)]],
            // syndication_fee: [this.selectedParticipant.syndication_fee ? this.selectedParticipant.syndication_fee : 0, [Validators.pattern(Custom_Regex.amount)]],
            // underwriting_fee: [this.selectedParticipant.underwriting_fee ? this.selectedParticipant.underwriting_fee : 0, [Validators.pattern(Custom_Regex.amount)]],
            // broker_commission: [this.selectedParticipant.broker_commission ? this.selectedParticipant.broker_commission : 0, [Validators.pattern(Custom_Regex.amount)]],
            // upsell_commission: [this.selectedParticipant.upsell_commission ? this.selectedParticipant.upsell_commission : 0, [Validators.pattern(Custom_Regex.amount)]],
            // purchase_price: [this.selectedParticipant.purchase_price ? this.selectedParticipant.purchase_price : 0, [Validators.pattern(Custom_Regex.amount)]],
            syndicate_name: [data.name],
            syndicator_id: [data.id, [Validators.pattern(Custom_Regex.spaces)]],
            // syndicator_id: [data?.participant_id, [Validators.pattern(Custom_Regex.spaces)]],
            management_fee: [data.management_fee ? data.management_fee : 0, [Validators.pattern(Custom_Regex.amount)]],
            participant_amount: [data.participant_amount ? data.participant_amount : 0, [Validators.pattern(Custom_Regex.amount)]],
            syndication_fee: [data.syndication_fee ? data.syndication_fee : 0, [Validators.pattern(Custom_Regex.amount)]],
            underwriting_fee: [data.underwriting_fee ? data.underwriting_fee : 0, [Validators.pattern(Custom_Regex.amount)]],
            broker_commission: [data.broker_commission ? data.broker_commission : 0, [Validators.pattern(Custom_Regex.amount)]],
            upsell_commission: [data.upsell_commission ? data.upsell_commission : 0, [Validators.pattern(Custom_Regex.amount)]],
            // purchase_price: [data.purchase_price ? data.purchase_price : 0, [Validators.pattern(Custom_Regex.amount)]],
            purchase_price: [ 0, [Validators.pattern(Custom_Regex.amount)]], // default set 0 while add 26th mar 2024
            type: [data.type ? data.type : ''],
            updateSyndictor_id:[data?.syndicator_id]
            // participation_value: [],
            // participation_id: []
        })
    }
    // addParticipantForm(value: any) {
    //     this.participantFaArray.push(this.participantForm('', value));
    // }

    removeParticipant(i: number, syndicateID: string = '',syndicator_id:any) {
        // 15th feb 2024
        
        if(syndicator_id){
            this.openparticipantRemovepopup(i,syndicateID);
            let index = this.syndicateList.findIndex((e) => e.id === syndicator_id);
            if (index > -1) {
                this.syndicateList[index].selected = 0;
            }
        }else{
            
            this.participantFaArray.removeAt(i);
        } 
        let index = this.syndicateList.findIndex((e) => e.id === syndicateID);
        if (index > -1) {
            this.syndicateList[index].selected = 0;
        }
        let formAmount = 0;
        for (let i = 0; i < this.fundDetailForm.value.participant_form.length; i++) {
            formAmount += Number(this.fundDetailForm.value.participant_form[i].participant_amount);
        }
        this.participantTotalAmount = this.actualParticipantAmount + formAmount;
    }
    participantChange(event: any) {
        this.getParticipantList();
    }
    remainingFundingAmount() {
        let total = 0;
        this.fundDetailForm.value.participant_form.length.map((result: any) => {
            total += Number(result.purchase_price)
        });
        this.totalRemainingFundingAmount = Number(this.fundDetails?.funding_amount) - total;

    }
    async getFundingList() {
        try {
            let data = {
                lead_id: this.leadID,
                sort_by:'name',
                order_by:'ASC'
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.PRE_FUNDING_LIST, data, 'participant', 'create');
            let response = await lastValueFrom(res$);
            if (response && response.data && response.status_code == "200") {
                this.fundDetails = response.data;
                // console.log('this.fundDetails',this.fundDetails);
                
                this.syndicateList = response.data.syndicates;
                let actulaAdvanceType = this.fundDetails.advance_type.toString().replace("ACH", "");
                if (actulaAdvanceType == 'Daily ') {
                    this.termLables = 'Days'
                } else if (actulaAdvanceType == 'Weekly ') {
                    this.termLables = 'Weeks'
                } else if (actulaAdvanceType == 'Bi-Weekly ') {
                    this.termLables = 'Bi-weeks'
                } else if (actulaAdvanceType == 'Monthly ') {
                    this.termLables = 'Months'
                }
                // this.participantSpecList = response.data.syndicates;
                this.syndicateList = response.data.syndicates.map((e: any) => ({ ...e, selected: 0 }));
                // this.participantSpecList = response.data.syndicates.map((e: any) => ({ ...e, selected: false }));
                // this.participantSpecList.forEach((object) => { object.toggle = false });
                this.sell_Rate = Number(response.data.sell_rate);
                //  this.getParticipantList();

            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    openparticipantRemovepopup(i: number, id: any) {
        Swal.fire({
            title: 'Are you sure want to remove?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it!',
            confirmButtonColor: this.color,
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                // this.participantTotalAmount =0;
                // this.actualParticipantAmount =0;
                this.deleteparticipant(i, id);
                this.getParticipantList();
                // this.participantFaArray.removeAt(i);
                this.participant_amount_check = true;
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.close()
            }
        })

    }
    async getParticipantList() {
        try {
            let data = {
                lead_id: this.leadID
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.PARTICIPANT_LIST, data, 'participant', 'create');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.partcipantList = response.data.participant;
               
                
                
                this.specParticipantListing = response.data.spec_to_participant;
               
                this.participantFaArray.clear();
                if (this.companyType != 'broker') {
                    for (let i = 0; i < this.specParticipantListing?.length; i++) {
                        for (let index = 0; index < this.syndicateList.length; index++) {
                            let index = this.syndicateList.findIndex((e) => e.id === this.specParticipantListing[i]?.syndicator_id);
                            // let index = this.syndicateList.findIndex((e) => e.id === this.specParticipantListing[i].id);  //15th feb
                            if (index > -1) {
                                this.syndicateList[index].selected = 1;
                                // console.log('index',index);
                                
                            }
                        }

                        this.participantFaArray.push(
                            this.participantForm(this.specParticipantListing[i])
                        );

                    }
                }
                // let indexSyndicator = this.syndicateList.findIndex((e) => e.id === this.specParticipantListing[e]?.syndicator_id);
                // if (indexSyndicator > -1) {
                //     this.syndicateList[index].selected = 1;
                // }
                setTimeout(() => {
                    let formAmount = 0;
                    for (let i = 0; i < this.partcipantList.length; i++) {
                        formAmount += Number(this.partcipantList[i].participant_amount);
                    }
                    this.participantTotalAmount = formAmount;
                    this.actualParticipantAmount = formAmount
                    // console.log("total", this.participantTotalAmount)
                    // if (this.participant_amount_check){
                    //     this.participantTotalAmount = 0;
                    //     this.actualParticipantAmount = 0
                    // }
                })

                // let value = this.partcipantList.map((m:any)=>{ let value = 0;
                //    value += Number(m.participant_amount)
                // return value})
                // this.sumOfParticipantAmount = value.reduce((acc, cur) => acc + cur, 0);
                for (let i = 0; i < this.syndicateList.length; i++) {
                    let index = this.partcipantList.findIndex((e) => e.syndicator_id === this.syndicateList[i].id);
                    if (index > -1) {
                        this.syndicateList[i].selected = 1;
                    }
                }
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    async deleteparticipant(i: any, id: any) {
        try {
            let data = {
                participant_id: id,
                lead_id: this.leadID

            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.PARTICIPATION_DELETE, data, 'participant', 'delete')
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                let data = this.partcipantList.filter((e) => e.id == id);
                let index = this.syndicateList.findIndex((e) => e.id === data[0]?.syndicator_id);
                if (index > -1) {
                    this.syndicateList[index].selected = 0;
                }
                this.partcipantList = this.partcipantList.filter((e) => e.id != id);
                setTimeout(() => {
                    let formAmount = 0;
                    for (let i = 0; i < this.partcipantList.length; i++) {
                        formAmount += Number(this.partcipantList[i].participant_amount);
                    }
                    this.participantTotalAmount = formAmount;
                    this.actualParticipantAmount = formAmount;
                    this.getLeadNotes();
                    // console.log("total", this.participantTotalAmount)
                    // if (this.participant_amount_check){
                    //     this.participantTotalAmount = 0;
                    //     this.actualParticipantAmount = 0
                    // }
                })
                Swal.close();

            }
            this.commonService.hideSpinner();


        } catch (error: any) {
            this.commonService.hideSpinner();          
            this.commonService.showError(error?.error?.message);
        }
    }

    // async getSyndicatesList() {
    //     try {
    //         this.commonService.showSpinner();
    //         const res$ = this.apiService.getReq(API_PATH.ALL_SYNDICATE_LIST, '', '');
    //         const response = await lastValueFrom(res$);
    //         if (response && response.status_code == "200") {
    //             this.syndicateList = response.data.map((e: any) => ({ ...e, selected: 0 }));
    //               this.getParticipantList();
    //         } else {
    //             this.commonService.showError(response.message);
    //         }
    //         this.commonService.hideSpinner()
    //     } catch (error) {
    //         this.commonService.hideSpinner();
    //         this.commonService.showErrorMessage(error);
    //     }
    // }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    async addParticipant() {
        let participantNonZeroData:any = [];
        this.fundDetailForm.value.participant_form.filter((e:any)=>{
            if(e.participant_amount != 0){
               participantNonZeroData.push(e)
               }
           })
        if(!participantNonZeroData.length){
            for (let i = 0; i < this.fundDetailForm.value.participant_form.length; i++) {
                if(this.fundDetailForm.value.participant_form[i].participant_amount == 0){
                this.commonService.showInfo('Participant amount should not be 0.')
                return
                }
            }
        }

        this.fundDetailForm.markAllAsTouched();
        if (this.fundDetailForm.valid) {
            // let amount = 0;
            // for (let i = 0; i < this.partcipantList.length; i++) {
            //     amount += Number(this.partcipantList[i].purchase_price);
            // }
            // let formAmount = 0;
            // for (let i = 0; i < this.fundDetailForm.value.participant_form.length; i++) {
            //     formAmount += Number(this.fundDetailForm.value.participant_form[i].purchase_price);
            // }
            // let totalAmount = amount + formAmount;
            let amount = 0;
            for (let i = 0; i < this.partcipantList.length; i++) {
                amount += Number(this.partcipantList[i].participant_amount);
            }
            let formAmount = 0;
            for (let i = 0; i < this.fundDetailForm.value.participant_form.length; i++) {
                formAmount += Number(this.fundDetailForm.value.participant_form[i].participant_amount);
            }
            // console.log(amount,formAmount,'value');

            let totalAmount = amount + formAmount;

            if (this.fundDetails?.funding_amount < totalAmount) {
                this.commonService.showError("Remaining amount should be 0 or greater than 0");
                return
            }
            //  console.log("nknk", this.fundDetailForm.value.participant_form)
            let registerDate = new Date().toJSON("yyyy/MM/dd HH:mm");
            this.commonService.showSpinner();
            try {
                let data = {
                    lead_id: this.leadID,
                    // participant: this.fundDetailForm.value.participant_form, 
                    participant: participantNonZeroData, // participant with non zero participant amount
                    current_date_time: this.getDate(registerDate),
                    participant_notes: this.participantNotes
                }
                const res$ = this.apiService.postReq(API_PATH.ADD_FUNDING_DETAILS, data, 'participant', 'create');
                let response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    // this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                    this.getParticipantList();
                    this.getDocumentsList();
                    this.getLeadNotes();
                } else {
                    this.commonService.showError(response.message);
                }
                this.commonService.hideSpinner();
            } catch (error: any) {
                this.commonService.hideSpinner();
                this.commonService.showErrorMessage(error);
            }
        } else {
            this.commonService.hideSpinner();
        }
    }

    // get remainingFund() {
    //     try {
    //         let fa = Number(this.fundDetails.funding_amount);
    //         let amount = 0;
    //         for (let i = 0; i < this.partcipantList.length; i++) {
    //             amount += Number(this.partcipantList[i].purchase_price);
    //         }
    //         let formAmount = 0;
    //         for (let i = 0; i < this.fundDetailForm.value.participant_form.length; i++) {
    //             formAmount += Number(this.fundDetailForm.value.participant_form[i].purchase_price);
    //         }
    //         //new
    //         // let finalAmount:any = (fa - amount - formAmount).toFixed(2);
    //         // let dollarUSLocale = Intl.NumberFormat('en-US');
    //         // return dollarUSLocale.format(finalAmount);
    //          return (fa - amount - formAmount).toFixed(2);
    //     } catch (error) {
    //         return 0
    //     }

    // }


    /**
     * @description new method for remainig amount 
     */

    get remainingFund() {
        try {
            let fa = Number(this.fundDetails.funding_amount);
            let formAmount = 0;
            for (let i = 0; i < this.fundDetailForm.value.participant_form.length; i++) {
                formAmount += Number(this.fundDetailForm.value.participant_form[i].participant_amount);
            }
            this.participantTotalAmount = this.actualParticipantAmount + formAmount;

            // let finalAmt = formAmount + this.sumOfParticipantAmount;
            return (fa - this.participantTotalAmount).toFixed(2);
        }
        catch (error) {
            return 0
        }

    }

    getLeadBasicDetails(leadData: any) {
        this.lead = leadData;

    }

    getDate(date: any) {
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }
    getFundingDateReceived(date: any){
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat}`)

    }
    getTotal(i: any, value: any) {
        const participantData = this.fundDetailForm.value.participant_form[i]
        const RTR = Number(participantData.participant_amount) * this.sell_Rate
        const participantAmt = Number(participantData.participant_amount);
        const syndication_fee = Number(participantData.participant_amount) * (Number(participantData.syndication_fee) / 100);
        const management_fee = RTR * (Number(participantData.management_fee) / 100);
        const underwriting_fee = Number(participantData.participant_amount) * (Number(participantData.underwriting_fee) / 100);
        const brokerCommission_fee = Number(participantData.participant_amount) * (Number(participantData.broker_commission) / 100);
        const upShellCommission_fee = Number(participantData.participant_amount) * (Number(participantData.upsell_commission) / 100);

        // upated method 26th march 2024
        const participantContractPercentage = participantAmt / Number(this.fundDetails?.funding_amount)*100 ;
        // console.log(participantContractPercentage, 'pp')
        
        const broker_commission = (Number(this.fundDetails?.funding_amount) * (this.sell_Rate - Number(this.fundDetails?.buy_rate))/100 * participantContractPercentage)
        // let total_purchase_price = participantAmt + syndication_fee + broker_commission;
        let total_purchase_price = participantAmt + syndication_fee + brokerCommission_fee;

        // console.log('broker_commission',broker_commission,'participantContractPercentage',participantContractPercentage,'participantAmt',participantAmt);
        
        // console.log('total_purchase_price',total_purchase_price);
        // 
        

        // let total_purchase_price = participantAmt + management_fee + syndication_fee + underwriting_fee + brokerCommission_fee + upShellCommission_fee;
        // let total_purchase_price = Number(participantData.participant_amount) + Number(participantData.management_fee) + Number(participantData.syndication_fee) + 
        // Number(participantData.underwriting_fee) + Number(participantData.broker_commission) + Number(participantData.upsell_commission);
        // console.log(total_purchase_price,'total data', this.participantFaArray.value);
        this.participantIndex = i;
        total_purchase_price = total_purchase_price?total_purchase_price:0;
        // console.log('total_purchase_price',total_purchase_price);
        
        this.participantsForm.patchValue({ purchase_price: total_purchase_price });
        // (($lenderOffer->funding_amount * ((float)$lenderOffer->sell_rate - (float)$lenderOffer->buy_rate))/100*$participantContractPercentage)


    }


/*   $syndication_fee    = ((float)$participant['participant_amount'] * (float)$participant['syndication_fee'])/100;
$participantContractPercentage = ((float)$participant['participant_amount']/(float)$lenderOffer->funding_amount*100);
$broker_commission  = $lenderOffer ? (($lenderOffer->funding_amount * ((float)$lenderOffer->sell_rate - (float)$lenderOffer->buy_rate))/100*$participantContractPercentage) : '';
$dueAmount = ((float)$participant['participant_amount'] + (float)$syndication_fee + (float)$broker_commission);
*/

    getDecimal(val: any) {
        return Number(val).toFixed(2)
    }
    async getLeadNotes() {
        try {
            this.commonService.showSpinner();
            let res$ = this.apiService.postReq(API_PATH.PARTICIPANT_LOGS, { lead_id: this.leadID, page: this.participantLogPage2, type: 'participant' }, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data.logs) {
                    this.leadNotesList = response.data.logs;
                    this.total = response.data.total
                } else {
                    this.leadNotesList = [];
                    this.total = 0;
                    this.participantLogPage2 = 1;
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
    onPageChange(p: number): void {
        this.participantLogPage2 = p;
        // this.getLeadDocuments();
        this.getLeadNotes();
    }
    // async exportLeadasExcel() {
    //     try {
    //         let selectedLeads = '';
    //         // if (this.leadIdArray.length) {
    //         //     selectedLeads = this.leadIdArray.join();
    //         //     console.log(this.leadIdArray,'hghg');

    //         // }
    //         const res = await this.partcipantList;
    //         //  await this.getLeadsDataForExport(selectedLeads); api response
    //         console.log(res,'kjkj');

    //         if (res.length) {
    //            let data =  this.excelService.exportAsExcelFile(res, 'testData');
    //            console.log(data,'jkkjj');

    //         } else {
    //             this.commonService.showError("No data found");
    //         }
    //     } catch (error: any) {
    //         this.commonService.showError(error.message);
    //     }
    // }


    initsendSpecForm() {
        this.sendSpecForm = this.fb.group({
            participant: ['', [Validators.required]],
            // , [Validators.required]
            document: [''],
            custom_note: ['']
        })
    }

    openfullView() {
        this.getPaginationList()
        this.tabView = false;
        this.getParticipantList();
    }
    sendSpec() {
        this.tabView = true;
        this.userListPage = 1;
        this.page = 1;
        this.getLeadDocuments();
        this.getspecParticipantList();
        this.getFundingList();
        this.getDocumentsList();
        this.getLeadNotes();
    }


    /**
     * @description get lead detail form controls
     */
    get l(): { [key: string]: AbstractControl } {
        return this.sendSpecForm.controls;
    }
    add(value: any) {
    }
    async getLeadDocuments() {
        try {
            this.commonService.showSpinner();
            let reqData: any = {
                lead_id: this.leadID,
                // records_per_page: this.limit,
                records_per_page: -1,
                page: this.page,
            }
            const res$ = this.apiService.postReq(API_PATH.LEAD_DOCUMENTS, reqData, 'lead', 'document-list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {

                if (this.page === 1) {
                    this.documentsList = response.data.documents?.sort((a:any, b:any) => a?.document_name.localeCompare(b?.document_name));
                    this.documentsList = response.data.documents.map((e: any) => ({ ...e, selected: false }));
                    this.documentsList.forEach((object) => { object.toggle = false });
                } else {
                    this.documentsList = [...this.documentsList, ...response.data.documents];
                }
                this.page < response.data.last_page ? this.hasMoreDocs = true : this.hasMoreDocs = false;

                // this.documentsList =[...this.documentsList , ...response.data.documents]
                // this.totalCount  = response.data.total_records
                // // this.currentPage = response.data.current_page
                this.commonService.hideSpinner();

            } else {
                this.documentsList = [];
            }
            // for (let i = 0; i < this.documentsList.length; i++) {
            //     if (this.documentsList[i].document_type != 'other') {
            //         this.docTypes = this.docTypes.filter(e => e.value != this.documentsList[i].document_type)
            //     }
            // }
        }
        catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
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
        // let data1 = document.getElementsByClassName('ngx-pagination')[1]?.getElementsByTagName('li');
        // for (let i = 0; i < data?.length; i++) {
        //     if (data1[i].className == 'current' || data1[i].className == 'current ng-star-inserted' || data1[i].className == 'ng-star-inserted current') {
        //         data1[i].style.background = this.color;
        //     } else {
        //         data1[i].style.background = 'none';

        //     }
        // }
    }
    async sendToParticipant(ids: any,syndicate_id:string,participantValue:any) {
        if(participantValue === 0){
        this.commonService.showInfo('Participant amount should not be 0.')
         return
        }
        this.fundDetailForm.markAllAsTouched();
        if (this.fundDetailForm.valid) {
            let amount = 0;
            for (let i = 0; i < this.partcipantList.length; i++) {
                amount += Number(this.partcipantList[i].participant_amount);
            }
            let formAmount = 0;
            for (let i = 0; i < this.fundDetailForm.value.participant_form.length; i++) {
                formAmount += Number(this.fundDetailForm.value.participant_form[i].participant_amount);
            }
            let totalAmount = amount + formAmount;
            if (this.fundDetails?.funding_amount < totalAmount) {
                this.commonService.showError("Remaining amount should be 0 or greater than 0");
                return
            }
            //  console.log("nknk", this.fundDetailForm.value.participant_form)
            let registerDate = new Date().toJSON("yyyy/MM/dd HH:mm");
            this.commonService.showSpinner();
            try {
                let data2 = this.fundDetailForm.value.participant_form;
               
                
                //15th feb 2024 
                // data2.map((m: any, index: any) => {
                //     if (m.syndicator_id == ids) {

                //         this.individual_id.push(this.fundDetailForm.value.participant_form[index])

                //     }
                // });
                if(ids){
                    data2.map((m: any, index: any) => {
                        if (m.updateSyndictor_id == ids) {
                            this.individual_id.push(this.fundDetailForm.value.participant_form[index]) //15th feb
                        }
                    });
                }else{
                     data2.map((m: any, index: any) => {
                    if (m.syndicator_id == syndicate_id) {
                        this.individual_id.push(this.fundDetailForm.value.participant_form[index])
                    }
                });
                }
                let data = {
                    lead_id: this.leadID,
                    participant: this.individual_id,
                    current_date_time: this.getDate(registerDate),
                    participant_notes:this.participantNotes
                }
 
                const res$ = this.apiService.postReq(API_PATH.ADD_FUNDING_DETAILS, data, 'participant', 'create');
                let response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    // this.getFundingList();
                    // this.initfundDetailForm();
                    // this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                    
                    this.getParticipantList();
                    this.getDocumentsList();
                    this.getLeadNotes();
                    this.individual_id = []
                } else {
                    this.commonService.showError(response.message);
                }
                this.commonService.hideSpinner();
            } catch (error: any) {
                this.commonService.hideSpinner();
                this.commonService.showErrorMessage(error);
            }
        } else {
            this.commonService.hideSpinner();
        }
    }
    loadMoreDocument() {
        if (this.hasMoreDocs) {
            this.page++;
            this.getLeadDocuments();
        }
    }
    loadMoreParticipant() {
        if (this.hasMoreUsers) {
            this.userListPage++;
            this.getspecParticipantList();
        }
    }


    async sendParticipantEmail() {
        if (this.companyType == 'broker') {
            this.sendSpecForm.get('document')?.setValidators([Validators.required]);
            this.sendSpecForm.get('document')?.updateValueAndValidity();
        } else {
            this.sendSpecForm.get('document')?.clearValidators();
            this.sendSpecForm.get('document')?.updateValueAndValidity();
        }
        this.sendSpecForm.markAllAsTouched();
        if (this.sendSpecForm.valid) {
            // console.log("kbhj", this.participantIdArray);
            // console.log("kbhj", this.documentIdArray);
            // if (!this.participantIdArray.length) {
            //     this.commonService.showError("Please select any participant");
            //     return
            // }
            // if (!this.documentIdArray.length) {
            //     this.commonService.showError("Please select any document");
            //     return
            // }
            // document_ids: this.documentIdArray,
            // syndicate_ids: this.participantIdArray,
            this.commonService.showSpinner();
            try {
                let data = {
                    lead_id: this.leadID,
                    // document_ids: this.documentIdArray,
                    // syndicate_ids: this.participantIdArray,
                    document_ids: this.sendSpecForm.value.document ? this.sendSpecForm.value.document : [],
                    syndicate_ids: this.sendSpecForm.value.participant,
                    // note: this.sendSpecForm.value.custom_note
                    participant_notes: this.sendSpecForm.value.custom_note
                    // participant_notes
                }
                this.participantNotes = this.sendSpecForm.value.custom_note;
                const res$ = this.apiService.postReq(API_PATH.SEND_EMAIL_TO_PARTICIPANT, data, 'participant', 'create');
                let response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.sendSpecForm.reset();
                    this.getLeadNotes();
                    this.checkEmailTemplateExistsParticipant('Participant');
                    // this.router.navigate([`/${this.userBaseRoute}/lead-detail/` + this.leadID]);
                } else {
                    this.commonService.showError(response.message);
                }
                this.commonService.hideSpinner();
            } catch (error: any) {
                this.commonService.hideSpinner();
                this.commonService.showErrorMessage(error);
            }
        } else {
            this.commonService.hideSpinner();
        }
    }


    onChange(id: any, target: EventTarget | null, index: number) {
        const input = target as HTMLInputElement;
        if (input.checked) {
            this.participantSpecList[index].toggle = true;
            if (!this.participantIdArray.includes(id)) {
                this.participantIdArray.push(id);
            }
        } else {
            this.participantSpecList[index].toggle = false;

            let i = this.participantIdArray.findIndex((x: any) => x === id);
            if (i > -1) {
                this.participantIdArray.splice(i, 1);
            }
        }
    }
    onDocumentChange(id: any, target: EventTarget | null, index: number) {
        const input = target as HTMLInputElement;
        if (input.checked) {
            this.documentsList[index].toggle = true;
            if (!this.documentIdArray.includes(id)) {
                this.documentIdArray.push(id);
            }
        } else {
            this.documentsList[index].toggle = false;

            let i = this.documentIdArray.findIndex((x: any) => x === id);
            if (i > -1) {
                this.documentIdArray.splice(i, 1);
            }
        }
    }
    /**
  * @description get users list eg company list if adminisrator is logged in
  */
    async getspecParticipantList(): Promise<any> {
        try {
            let url = `?&page_limit=${this.usersListLimit}&page=${this.userListPage}&lead_id=${this.leadID}&status=Active`;

            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.SYNDICATES_LIST + url, 'participant', 'create');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.hasMoreUsers = response.data.hasMorePages;
                if (this.userListPage == 1) {
                    this.totalUsersCount = response.data.total;
                    this.participantSpecList = response.data.data;

                } else {
                    this.participantSpecList = [...this.participantSpecList, ...response.data.data];

                }
                // this.participantSpecList = response.data.data.map((e: any) => ({ ...e, selected: false }));
                // this.participantSpecList.forEach((object) => { object.toggle = false });

            } else {
                this.participantSpecList = [];
                this.hasMoreUsers = false;
                this.userListPage = 1;
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
    getMoreDocuments() {
        if (this.hasMoreDocs) {
            this.page++;
            this.getLeadDocuments();
        }
    }
    // model: any, 
    async checkEmailTemplateExists(actionType: any) {
        if (this.companyType == 'broker') {
            this.sendSpecForm.get('document')?.setValidators([Validators.required]);
            this.sendSpecForm.get('document')?.updateValueAndValidity();
        } else {
            this.sendSpecForm.get('document')?.clearValidators();
            this.sendSpecForm.get('document')?.updateValueAndValidity();
        }
        this.sendSpecForm.markAllAsTouched();
        if (this.sendSpecForm.valid) {
            if (Array.isArray(this.sendSpecForm.value.document)) {
                this.commonService.showSpinner();
                if(actionType == 'Participant'){
                    if(this.lead.e_sign_status == 'hub_sign'){
                        actionType =  'Participant - Hub Sign'
                    }else{
                        actionType == 'Participant'  
                    }
                }
                // console.log("actionType",actionType)
                try {
                    const res$ = this.apiService.postReq(API_PATH.LEAD_EMAIL_TEMPLATE_EXIST, { lead_id: this.leadID, action_type: actionType }, 'lead', 'view');
                    let response = await lastValueFrom(res$);
                    if (response && response.status_code == "200") {
                        // this.commonService.showSuccess(response.message);
                        if (actionType == 'Send Spec To Participants') {
                            this.sendParticipantEmail();
                        } else if ((actionType == 'Participant' || actionType == 'Participant - Hub Sign')) {
                            this.openfullView();
                            //  this.router.navigate([`/${this.userBaseRoute}/propose-submission/` + this.leadID]);
                        }

                    }
                    this.commonService.hideSpinner();
                } catch (error: any) {
                    this.commonService.hideSpinner();
                    if (error?.error?.data.already_exist == 0) {
                        Swal.fire({
                            title: error?.error?.message,
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
                    } else {
                        if (error.error && error.error.message) {
                            this.commonService.showError(error.error.message);
                        } else {
                            this.commonService.showError(error.message);

                        }
                    }
                }
            } else {
                this.sendParticipantEmail();
            }
        }
    }
    async checkEmailTemplateExistsParticipant(actionType: any) {
        this.commonService.showSpinner();
        this.commonService.showSpinner();
        if(actionType == 'Participant'){
            if(this.lead.e_sign_status == 'hub_sign'){
                actionType =  'Participant - Hub Sign'
            }else{
                actionType == 'Participant'  
            }
        }
        // console.log("actionType",actionType)
        try {
            const res$ = this.apiService.postReq(API_PATH.LEAD_EMAIL_TEMPLATE_EXIST, { lead_id: this.leadID, action_type: actionType }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if ((actionType == 'Participant' || actionType == 'Participant - Hub Sign')) {
                    this.openfullView();
                    //  this.router.navigate([`/${this.userBaseRoute}/propose-submission/` + this.leadID]);
                }

            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error?.error?.data.already_exist == 0) {
                Swal.fire({
                    title: error?.error?.message,
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
            } else {
                if (error.error && error.error.message) {
                    this.commonService.showError(error.error.message);
                } else {
                    this.commonService.showError(error.message);

                }
            }
        }
    }

    //document list section
    async getDocumentsList() {
        try {
            this.commonService.showSpinner();
            let reqData: any = {
                lead_id: this.leadID,
                records_per_page: this.limit,
                page: this.page,
                type: 'deal_participants'
            }
            const res$ = this.apiService.postReq(API_PATH.LEAD_DOCUMENTS, reqData, 'lead', 'document-list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if(response.data){
                    this.documentListing = response.data.documents;
                    // console.log('this.documentListing',this.documentListing);
                    
                    this.listTotal =  response.data?.total_records
                }

                // if (this.page === 1) {
                //     this.documentListing = response.data.documents;
                //     this.documentListing = response.data.documents.map((e: any) => ({ ...e, selected: false }));
                //     this.documentListing.forEach((object) => { object.toggle = false });
                // } else {
                //     this.documentListing = [...this.documentListing, ...response.data.documents];
                // }
                this.page < response.data.last_page ? this.hasMoreDocs = true : this.hasMoreDocs = false;
                // console.log('this.documentListing',this.documentListing);
                // console.log( response.data,'hdgsdhgsdhj');
                
                

                // this.documentsList =[...this.documentsList , ...response.data.documents]
                // this.totalCount  = response.data.total_records
                // // this.currentPage = response.data.current_page
                this.commonService.hideSpinner();

            } else {
                this.documentListing = [];
            }
            // for (let i = 0; i < this.documentsList.length; i++) {
            //     if (this.documentsList[i].document_type != 'other') {
            //         this.docTypes = this.docTypes.filter(e => e.value != this.documentsList[i].document_type)
            //     }
            // }
        }
        catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
   

    async downloadFile(doc: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DOWNLOAD_FILE, { file: doc.actual_name }, 'lead', 'list', 'arraybuffer');
            const response = await lastValueFrom(res$);
            const arrayBufferView = new Uint8Array(response);
            const file = new Blob([arrayBufferView], { type: doc.document_type });
            let url = window.URL.createObjectURL(file);
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
            if (this.companyType == 'funded') {
                a.download = doc.actual_name;
            } else {
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
    async deleteDoc(docId: string) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DELETE_LEAD_DOC, { document_id: docId }, 'lead', 'document-delete');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                // let data = this.documentsList.filter((e) => e.document_id == docId);
                // if (data[0].document_type != 'other') {
                //     let data2 = this.actualdocTypes.filter((e) => e.value == data[0].document_type);
                //     this.docTypes.push(data2[0])
                // }
                this.documentListing = this.documentListing.filter(e => e.document_id !== docId);


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
    }
    /**
  * @description open modal
  * @param modal 
  * @author Shine Dezign Infonet Pvt. Ltd.
  */
    openModal(modal: TemplateRef<any>, doc: any) {
        this.documentDetails = {
            name: doc.document_name,
            id: doc.document_id
        }
        let options: any = {
            backdrop: 'static',
        }
        this.modal = this.modalService.open(modal, options)
    }
    onModelClose(value: any) {
        if (value && value.name) {
            const i = this.documentListing.findIndex((e) => e.document_id === this.documentDetails.id);
            if (i > -1) {
                this.documentListing[i].document_name = value.name;
            }
        }
        this.closeModal();
    }
    closeModal() {
        this.modal.close();
    }

    sortBy(col: string) {
        if (!this.documentListing.length) {
            return;
        }
        if (this.searchOrder.sortby === col) {
            if (this.searchOrder.order === 'ASC') {
                this.searchOrder.order = 'DESC'
            } else {
                this.searchOrder.order = 'ASC'
            }
        } else {
            this.searchOrder.order = 'DESC';
            this.searchOrder.sortby = col;
        }
        this.getDocumentsList();
    }
    onPageDocumentChange(p: number): void {
        this.page = p;
        this.getDocumentsList();
        // console.log( this.page,'djsdjhsdkjs');
        
        // this.getLeadNotes();
    }

 updateToDecimal(value:string|number){
  return Number(value).toFixed(2)
 }
}
