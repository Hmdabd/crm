import { Component, OnInit } from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { Subscription, lastValueFrom } from 'rxjs';
import * as Constants from '@constants/constants';
import { Roles } from '@constants/constants';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';


@Component({
    selector: 'app-dashboard-cards',
    templateUrl: './dashboard-cards.component.html',
    styleUrls: ['../../styles/dashboard.scss', './dashboard-cards.component.scss']
})
export class DashboardCardsComponent implements OnInit {
    // dashboardData: any = {};
    dashboardData: Array<any> = [];
    roles = Constants.Roles;
    userRole: string = '';
    canListLead: boolean = false;
    colorSubs!: Subscription;
    color: string = ''
    getResponse: boolean = true;
    companyType: string = ''
    // viewfundedCount: boolean = false;
    // viewdeclinedCount: boolean = false;
    // viewUserCount: boolean = false;
    // viewactiveLeadsCount: boolean = false;
    // viewtotalLeadCount: boolean = false;
    // viewappOutCount: boolean = false;
    // viewdocsInCount: boolean = false;
    // viewsubmittedCount: boolean = false;
    // viewapprovedCount: boolean = false;
    // viewcontractOutCount: boolean = false;
    // viewcontractInCount: boolean = false;
    backgroundCardsColor: string = '#FFE9EA'
    canViewDashboard: boolean = false;

    constructor(
        private authService: AuthService,
        private commonService: CommonService,
        private apiService: ApiService,
        private ngxLoader: NgxUiLoaderService,
        private router: Router) { }

    ngOnInit(): void {
        this.getUserDetails();
        this.canListLead = this.authService.hasPermission('lead-list');
        this.getDashboardData();
        this.canViewDashboard = this.authService.hasPermission('manage-cards');
    }


    async getDashboardData(): Promise<any> {
        try {
            this.ngxLoader.startLoader('dashboard-loader');
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.DASHBOARD, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.getResponse = false;
                this.dashboardData = response.data;



            }
            this.commonService.hideSpinner();
            this.ngxLoader.stopLoader('dashboard-loader');
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.ngxLoader.stopLoader('dashboard-loader');
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }

    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.userRole = ud.role;
                this.color = ud?.color;
                this.companyType = ud?.company_type;
                this.getColorOnUpdate();

                // for (let i = 0; i < ud.manage_card_permission.length; i++) {
                //    if(ud.manage_card_permission[i].permission_name == 'funded-leads-count'){
                //        this.viewfundedCount= ud.manage_card_permission[i].is_required
                //    }else  if(ud.manage_card_permission[i].permission_name == 'declined-leads-count'){
                //     this.viewdeclinedCount = ud.manage_card_permission[i].is_required
                // }else  if(ud.manage_card_permission[i].permission_name == 'total-users-count'){
                //     this.viewUserCount = ud.manage_card_permission[i].is_required
                // }else  if(ud.manage_card_permission[i].permission_name == 'active-leads-count'){
                //     this.viewactiveLeadsCount = ud.manage_card_permission[i].is_required
                // }else  if(ud.manage_card_permission[i].permission_name == 'total-leads-count'){
                //     this.viewtotalLeadCount = ud.manage_card_permission[i].is_required
                // }  else  if(ud.manage_card_permission[i].permission_name == 'app-out-leads-count'){
                //     this.viewappOutCount = ud.manage_card_permission[i].is_required
                // } else  if(ud.manage_card_permission[i].permission_name == 'docs-in-leads-count'){
                //     this.viewdocsInCount = ud.manage_card_permission[i].is_required
                // }  else  if(ud.manage_card_permission[i].permission_name == 'submitted-leads-count'){
                //     this.viewsubmittedCount = ud.manage_card_permission[i].is_required
                // } else  if(ud.manage_card_permission[i].permission_name == 'approved-leads-count'){
                //     this.viewapprovedCount = ud.manage_card_permission[i].is_required
                // } else  if(ud.manage_card_permission[i].permission_name == 'contract-out-leads-count'){
                //     this.viewcontractOutCount = ud.manage_card_permission[i].is_required
                // }else  if(ud.manage_card_permission[i].permission_name == 'contract-in-leads-count'){
                //     this.viewcontractInCount = ud.manage_card_permission[i].is_required
                // }

                // }

            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
 
    // leadRoute(statusname: any){
    //     if (this.userRole === Roles.ADMINISTRATOR) {
    //         this.router.navigate(['/admin/leads'],{ queryParams: {leadStatus: statusname}})
    //     }else{
    //         this.router.navigate([`/${this.userBaseRoute}/leads`],{ queryParams: {leadStatus: statusname}});
    //     }
    // }
    leadRoute(displayname: any) {
        let name = displayname.replaceAll('-', ' ');
        name = name.replace('total', '');
        name = name.replace('count', '');
        if (this.userRole === Roles.ADMINISTRATOR) {
            this.router.navigate(['/admin/leads'], { queryParams: { leadStatus: name } })
        } else {
            this.router.navigate([`/${this.userBaseRoute}/leads`], { queryParams: { leadStatus: name } });
        }
    }
    adjustBackgroundColor(color: any, amount: any) {
        return '#' + color.replace(/^#/, '').replace(/../g, (color: string) => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    
    userRoute() {
        if (this.userRole === Roles.ADMINISTRATOR) {
            this.router.navigate(['/admin/user'])
        } else {
            this.router.navigate([`/${this.userBaseRoute}/user`]);
        }
    }

}
