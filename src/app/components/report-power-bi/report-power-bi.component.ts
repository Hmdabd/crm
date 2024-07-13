import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { API_PATH } from '@constants/api-end-points';
import { powerBIUser } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-report-power-bi',
  templateUrl: './report-power-bi.component.html',
  styleUrls: ['./report-power-bi.component.scss', '../../styles/dashboard.scss']
})
export class ReportPowerBiComponent implements OnInit {
powerBi = powerBIUser
link:string=''
isView:boolean=false;
logedInRole:string='';
userTogetData:string = '';
powerBiFinalLink:any=''
  constructor(private sanitizer:DomSanitizer,private commonService:CommonService,
    private apiService:ApiService,
    private authService:AuthService
  ) { }

  ngOnInit(): void {
    this.getUserDetails();
  }
  getUrl(post:any)
  {
    this.isView = true
    this.powerBiFinalLink = this.sanitizer.bypassSecurityTrustResourceUrl(post);
  }
	/**
	 * @description Get response of all Power Bi link for all user. by add user_type=all
	 */
	async getPowerbiLink() {
		try {
			this.commonService.showSpinner();
			let url = `?user_type=${this.userTogetData}`
			const res$ = this.apiService.getReq(API_PATH.POWER_BI_REPORT + url, 'power-bi', 'report');
			let response = await lastValueFrom(res$);
			if (response && response.data) {
				let data = response.data;
        this.link = data?.url;
        this.getUrl(this.link)
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

  getUserDetails() {
    let ud = this.authService.getUserDetails();
    if(ud){
      this.logedInRole = ud.role
    }
    switch(this.logedInRole){
      case 'Company' :
        this.userTogetData = this.powerBi.COMPANY
        break;
      case 'Branchmanager':
         this.userTogetData =  this.powerBi.BRANCHMANGER
        break;
      case 'Sales' :
      this.userTogetData  =  this.powerBi.SALES
        break;
      case 'Submitter':
        this.userTogetData = this.powerBi.SUBMITTER
        break;
      case 'Underwriter':
        this.userTogetData = this.powerBi.UNDERWRITER
        break;
        default:  this.userTogetData = this.powerBi.CUSTOM
        
    }
    
   this.getPowerbiLink()
   } 
}
