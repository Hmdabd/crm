import { ChangeDetectorRef, Component, ElementRef, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Mask, Roles } from '@constants/constants';
import moment from 'moment';
@Component({
    selector: 'app-hub-sign',
    templateUrl: './hub-sign.component.html',
    styleUrls: ['./hub-sign.component.scss']
})

export class HubSignComponent implements OnInit {
    modal!: NgbModalRef;
    role = Roles;
    userDetails: any = {};
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    userRole: string = ''
    dateFormat: string = '';
    timeZone: string = '';
    customerSign: string = '';
    token: string = '';
    companyType: string = '';
    documentName: string = '';
    documentPath: string = '';
    documentType: string = '';
    packageOpenedDate: string = '';
    signatureAdoptedDate: string = '';
    documentActualName: string = '';
    documentDownloadPath: string = '';
    isSigned:boolean = false;
    isExhibit:boolean = false;

    // tabsection
    tabActive = {
        id: 'hubSign',
        number: 1
    }
    tabView: boolean = true;
    isParticipant:boolean = false;
    submitterTabIndex:number =0 ;
    signDocDetail:any={}
    constructor(
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
        this.getUserDetails();
        let queryParams = this.route.snapshot.queryParams;
        if (queryParams) {
            // console.log('queryParams',queryParams);
            
            if (queryParams['token']) {
                this.token = queryParams['token'];
            }
            if (queryParams['isSigned']) {
                let _isSigned = queryParams['isSigned'];
                this.isSigned = _isSigned == '1'?true:false;

            }
            if (queryParams['document_name']) {
                this.documentName = queryParams['document_name'];
            }
            if (queryParams['path']) {
                this.documentPath = queryParams['path'];
            }
            if (queryParams['document_type']) {
                this.documentType = queryParams['document_type'];
                 this.isPrticipantCheck()
            }
            if (queryParams['actual_name']) {
                this.documentActualName = queryParams['actual_name'];
            }
            if (queryParams['download_path']) {
                this.documentDownloadPath = queryParams['download_path'];
                // console.log(' this.documentDownloadPath', this.documentDownloadPath);
                
            }


        }
        this.commonService.hideSpinner();

    }
    isPrticipantCheck(){
        if(this.documentType === 'lead_participant_fundings'){
        // this.isParticipant = false;
        this.isExhibit = true;
        // console.log('this.isParticipant',this.isParticipant);
        
        }else{
        this.isExhibit = false;

            // this.isParticipant = false;
        }
    }

    goBack() {
        this.loc.back();
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

    

    openModel(content: any) {
        try {
            this.modal = this.modalService.open(content, { backdrop: 'static' });
            this.packageOpenedDate = new Date().toJSON("yyyy/MM/dd HH:mm");
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
   

    focusInvalidField() {
        const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
            ".form-group .ng-invalid"
        );
        if (firstInvalidControl)
            firstInvalidControl.focus();
    }

    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
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
            formData.append('package_opened_at', this.getDate(this.packageOpenedDate));
            formData.append('signature_adopted_at', this.getDate(this.signatureAdoptedDate));
            formData.append('package_signed_at', this.getDate(registerDate));

            const res$ = this.apiService.postReq(API_PATH.HUB_SIGN_UPDATE, formData, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.commonService.showSuccess(response.message);
                // enable download as copy when sign is updated.
                this.isSigned = true;
                // if(this.isParticipant){ // 27th may 24 update single page
                //     this.onGetSignedDocs();  
                //     this.toFinalStep();   
                
                // }else{

                //     this.redirect();
                    
                // }
                this.changeDetectorRef.detectChanges();
            }
            if(!this.isParticipant){
            this.commonService.hideSpinner()
        }
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }


    }




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
    getDate(date: any) {
        return moment(date).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }



    get getUserRole() {
        return this.authService.getUserRole().toLowerCase();
    }

    redirect() {
        this.router.navigate(['/thanx-message'], { queryParams: { type: 'hub_sign' } });
    }
    closeModal() {
        this.signatureAdoptedDate = new Date().toJSON("yyyy/MM/dd HH:mm");
        // this.onGetSignedDocs();
        this.onOfficerInfoSubmit();
        this.modal.close();
    }

    toFinalStep(){
       this.tabActive = {
        id:'final-Step',
        number :2
       }
    }


    async onGetSignedDocs() {
        try {
            this.commonService.showSpinner();
           let data = {
            token:this.token
           }

            const res$ = this.apiService.postReq(API_PATH.HUB_SIGN_DOWNLOAD_DOC, data, '', '');
            let response = await lastValueFrom(res$);
            if (response) {
                // this.toFinalStep();
                this.signDocDetail = response;
                this.downloadSignFile()
                if (this.submitterTabIndex < 1) {
                    this.submitterTabIndex = 1;
                }
                // console.log('  this.signDocDetail',  this.signDocDetail);
                
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
    validateTabChange(number: number, id: string) {
        try {
            
            if (number > this.submitterTabIndex + 1) return;
            
            // console.log(number > 1,id);
            // console.log(number,id);
            this.tabActive = {
                id: id,
                number: number
            }
        } catch (error: any) {
            console.log(error.message);
        }
    }
    async downloadSignFile() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.HUB_SIGN_DOWNLOAD, { file: this.signDocDetail?.actual_name }, '', '', 'arraybuffer');
            const response = await lastValueFrom(res$);
            const arrayBufferView = new Uint8Array(response);
            const file = new Blob([arrayBufferView], { type: this.signDocDetail?.document_type });
            let url = window.URL.createObjectURL(file);
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
            a.download = this.signDocDetail?.actual_name ;
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
    getDownloadDoc(){
        // window.open(this.documentPath)
        this.onGetSignedDocs()
    }
}




