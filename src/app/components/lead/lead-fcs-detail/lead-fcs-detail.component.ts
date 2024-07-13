import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-lead-fcs-detail',
    templateUrl: './lead-fcs-detail.component.html',
    styleUrls: ['./lead-fcs-detail.component.scss']
})
export class LeadFcsDetailComponent implements OnInit {
    fcsDetailList: any;
    leadId: string = '';
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    dateFormat: string = '';
    timeZone: string = '';
    withHoldValue:any = 0;
    activelenderList: Array<any> =  [];
    lenderIdArray: Array<any> =  [];
    color: string = '';
    boo: boolean = false;
    @ViewChild('selectAll') selectAll!: ElementRef;
    note: string = ''
    companyType: string = '';
    @Output() getFSCsheetUrl = new EventEmitter<{url:string,isSavedFcs:boolean}>();
    constructor(private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private authService:AuthService) { }

    ngOnInit(): void {
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadId = params['id'];
            this.getfcsDetail();
            this.getUserDetails();
        }
    }
   
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
          this.getUserDetails();
        });
      }

    async getfcsDetail() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.FCS_LEAD_DETAILS, { lead_id: this.leadId }, 'fcs', ' preview');
            const response = await lastValueFrom(res$);
            if (response && response.data) {
                this.fcsDetailList = response.data;
                this.withHoldValue =Number(this.fcsDetailList?.withholding_percentage).toFixed(2);
                this.activelenderList = response.data.lender;
                this.activelenderList = response.data.lender.map((e: any) => ({ ...e, selected: false }));
                this.note = this.fcsDetailList.note
                this.getFSCsheetUrl.emit({url:this.fcsDetailList?.view_sheet,
                    isSavedFcs:this.fcsDetailList?.fcs_saved})
              //  this.selectAll.nativeElement.checked = false;
            //    this.activelenderList.forEach((object) => { object.toggle = false });
               
                 
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if(error?.error?.message != 'FCS not saved yet.'){
                this.commonService.showErrorMessage(error);
            }
           
        }
    }

    fcsErrorMessage(){
        this.commonService.showError('No FCS Sheet is created yet');
    }

    getAdjustment(monthly: number, monthlytruerevenue: any){
        let adjustmentvalue = 0;
        if(monthly && monthlytruerevenue){
            adjustmentvalue = Number(monthly) - Number(monthlytruerevenue);
            return adjustmentvalue
        }else{
            return ''
        }  
    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.getColorOnUpdate();
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.companyType = ud?.company_type;
                this.style={fill:ud?.color};
                this.color=ud?.color;
                // this.stroke={stroke:ud?.color};
                this.background={background:ud?.color};
            
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getDate(date: any) {
        // .tz(this.timeZone)
        if(date){
            return moment(date).format(`${this.dateFormat}`)
        } else{
             return ''
        }
     
    }
    onLenderChange(id: any, target: EventTarget | null, index: number) {
        const input = target as HTMLInputElement;
        let status = 0;
        if (input.checked) {
            this.lenderIdArray = []
            this.activelenderList[index].status = 1;
            if (!this.lenderIdArray.includes(id)) {
                this.lenderIdArray.push(id);
            }
            this.getactiveLender(1)
        } 
        else {
            this.lenderIdArray = []
            this.activelenderList[index].status = 0;
            if (!this.lenderIdArray.includes(id)) {
                this.lenderIdArray.push(id);
            }
            this.getactiveLender(0)
            // let i = this.lenderIdArray.findIndex((x: any) => x === id);
            // if (i > -1) {
            //     this.lenderIdArray.splice(i, 1);
            // }
        }
        
    }

    async getactiveLender(status: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LENDER_UPDATE_STATUS, {id: this.lenderIdArray , status: status}, 'fcs', ' preview');
            const response = await lastValueFrom(res$);
            if (response) {
                this.commonService.showSuccess(response.message);
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if(error?.error.message != 'FCS not saved yet.'){
                this.commonService.showErrorMessage(error);
            }
            
        }
    }

    onCheckingAll(target: any) {
        this.lenderIdArray = [];
        let status = 0;
        for (let i = 0; i < this.activelenderList.length; i++) {
            this.activelenderList[i].selected = target.checked;
            if (target.checked) {
                this.boo = true;
                status = 1
                this.activelenderList[i].toggle = true
                this.lenderIdArray.push(this.activelenderList[i].id);
                
            } else {
                this.lenderIdArray.push(this.activelenderList[i].id);
                status = 0;
                this.activelenderList[i].toggle = false;
                this.boo = false;
            }
        }
        // console.log("jbhjv", this.lenderIdArray);
        this.getactiveLender(status);

        // this.boo = false;
    }
}
