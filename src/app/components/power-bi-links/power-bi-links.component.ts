import { Component, OnInit } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { Roles, powerBIUser } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
	selector: 'app-power-bi-links',
	templateUrl: './power-bi-links.component.html',
	styleUrls: ['./power-bi-links.component.scss', '../../styles/dashboard.scss']
})
export class PowerBiLinksComponent implements OnInit {

	companyLink: string = "";
	salesLink: string = "";
	underwriterLink: string = "";
	submitterLink: string = "";
	branchManagerLink: string = "";
	customLink: string = "";
	allLinkValidate: any = {
		sales: false,
		underwriter: false,
		submitter: false,
		branchMgnr: false,
		company: false,
		custom: false
	}
	powerBi = powerBIUser;
	constructor(private commonService: CommonService,
		private apiService: ApiService,
	) { }

	ngOnInit(): void {
		this.getPowerbiLink()
	}
	/**@description This method invoke when user submit the link to the server before submitting it's check 
	 * validate the link.
	 * @param link we got row url from Link param eg http or https: //anyurl
	 * @param userType we got user type as company sales underwriter custom all role value we get in from userType variable
	 */
	async getUpdateLink(link: string, userType: string) {
		try {
			if (!this.checkLink(link)) {
				this.commonService.showSpinner();
				let data = {
					url: link,
					user_type: userType
				}
				const res$ = this.apiService.postReq(API_PATH.POWER_BI_LINK, data, 'power-bi', 'link');
				let response = await lastValueFrom(res$);
				if (response && response.data) {

				}
			} else {
				this.allLinkValidate[userType] = true;
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
	/**@description Check the link from regex if its fail to match return false */
	checkLink(link: string) {
		var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
		var regex = new RegExp(expression);

		let result = link.match(regex);
		if (!result) {
			return true
		} else {
			return false
		}
	}
	/**
	 * @description Get response of all Power Bi link for all user. by add user_type=all
	 */
	async getPowerbiLink() {
		try {
			this.commonService.showSpinner();
			let url = `?user_type=all`
			const res$ = this.apiService.getReq(API_PATH.POWER_BI_REPORT + url, 'power-bi', 'report');
			let response = await lastValueFrom(res$);
			if (response && response.data) {
				let data = response.data;
				data.forEach((ele: any) => {
					switch (ele?.user_type) {
						case this.powerBi.COMPANY:
							this.companyLink = ele?.url
							break;
						case this.powerBi.BRANCHMANGER:
							this.branchManagerLink = ele?.url
							break;
						case this.powerBi.CUSTOM:
							this.customLink = ele?.url
							break;
						case this.powerBi.SALES:
							this.salesLink = ele?.url
							break;
						case this.powerBi.SUBMITTER:
							this.submitterLink = ele?.url
							break;
						case this.powerBi.UNDERWRITER:
							this.underwriterLink = ele?.url
							break;

					}
				});

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
