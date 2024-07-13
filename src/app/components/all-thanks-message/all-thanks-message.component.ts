import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-all-thanks-message',
  templateUrl: './all-thanks-message.component.html',
  styleUrls: ['./all-thanks-message.component.scss']
})
export class AllThanksMessageComponent implements OnInit {
  thanksMessage: string = '';
   token: string = ''

    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute
        ) { }

    ngOnInit(): void {
        
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.token = params['id'];
            this.getThanksMessage();
        } else {
            this.commonService.showError('');
        }
    }
    async getThanksMessage() {
        try {
            let data = {
                token: this.token
            }
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.VERIFY_LEAD_SOURCE_THANKS_MESSAGE, data, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.thanksMessage = response.data;
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
