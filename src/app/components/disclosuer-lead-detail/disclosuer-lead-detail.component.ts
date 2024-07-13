import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Mask } from '@constants/constants';
import { NgbAccordion, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-disclosuer-lead-detail',
    templateUrl: './disclosuer-lead-detail.component.html',
    styleUrls: ['../lead/lead-detail/lead-detail.component.scss', './disclosuer-lead-detail.component.scss']
})

export class DisclosuerLeadDetailComponent implements OnInit {
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    dateFormat: string = '';
    timeZone: string = '';
    userRole: string = '';
    lead: any = {};
    leadID: string = ''
    modal!: NgbModalRef;
    customerSign: string = '';
    @ViewChild('acc', { static: false }) accordion!: NgbAccordion;
    token: string = '';
    mask = Mask;


    constructor(private commonService: CommonService,
        private authService: AuthService,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private router: Router



    ) { }

    ngOnInit(): void {
        this.getUserDetails();
        let queryParams = this.route.snapshot.queryParams;
        if (queryParams && queryParams['c']) {
            this.color = queryParams['c'];
           
        } 
        if (queryParams && queryParams['lead_id']) {
            this.leadID = queryParams['lead_id'];
            this.getLeadDetailsList()
        } 

    }
    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userRole = ud.role;
                this.timeZone = ud.time_zone;
                this.color = ud?.color;
                this.dateFormat = ud.date_format;
                this.style = { fill: ud?.color };
                // this.companyType = ud.company_type;
                this.background = { background: ud?.color };
                this.getColorOnUpdate();

            }
        } catch (error: any) {

            this.commonService.showError(error.message);
        }
    }
    toggle(ID: string) {
        setTimeout(() => this.accordion.toggle(ID), 0);
    }

    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }

    async getLeadDetailsList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_DETAILS + this.leadID, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lead = response.data;
                this.convertImageToBase64(this.lead.disclouser_document_sign);
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
    convertImageToBase64(imgUrl: any) {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = image.naturalHeight;
            canvas.width = image.naturalWidth;
            ctx?.drawImage(image, 0, 0);
            const dataUrl = canvas.toDataURL();
            this.customerSign = dataUrl;
        }
        image.src = imgUrl;
    }
    getDate(date: any) {
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
    }
    getBussinessDate(date: any) {
        if (date) {
            return moment(date).format(`${this.dateFormat}`)
        } else {
            return ''
        }


    }
    openModel(content: any) {
        try {
            this.modal = this.modalService.open(content, { backdrop: 'static' });
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    closeModal() {
        this.modal.close();
    }

  async finalSubmit() {
                try {
                    this.commonService.showSpinner();
                    let data = {
                        lead_id: this.leadID,
                        sign: this.customerSign
                    };
                    const res$ = this.apiService.postReq(API_PATH.DISCLOSURE_SIGN_API, data, '', '');
                    let response = await lastValueFrom(res$);
                    if (response) {
                        this.commonService.showSuccess(response.message);
                        this.closeModal();
                         this.redirect();

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
            
        // if (this.customerSign) {
        //     console.log(this.customerSign);

        // }
    }
    redirect() {
        this.router.navigate(['/thanx-message'], { queryParams:{type: 'discloser'}});
    }

}
