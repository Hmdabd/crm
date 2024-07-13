import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-disclosure-thanx-message',
  templateUrl: './disclosure-thanx-message.component.html',
  styleUrls: ['./disclosure-thanx-message.component.scss']
})
export class DisclosureThanxMessageComponent implements OnInit {
  thanksMessage: string = '';
  companyID: string = '';
  type: string = '';

  constructor(
      private commonService: CommonService,
      private apiService: ApiService,
      private route: ActivatedRoute
      ) { }

  ngOnInit(): void {
      let queryParams = this.route.snapshot.queryParams;
            if(queryParams) {
                if(queryParams['type']){
                    this.type = queryParams['type'];
                    this.getThanksMessage();
                }   
                
            }
  }
  async getThanksMessage() {
      try {
        let url = `?type=${this.type}`;
          this.commonService.showSpinner();
        const res$ = this.apiService.getReq(API_PATH.GET_DISCLOSURE_THANKS_MESSAGE + url, '', '');
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
