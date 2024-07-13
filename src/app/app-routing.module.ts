import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from '@components/on-boarding/forgot-password/forgot-password.component';
import { LoginComponent } from '@components/on-boarding/login/login.component';
import { ResetPasswordComponent } from '@components/on-boarding/reset-password/reset-password.component';
import { PermissionGuard } from './guards/admin.guard';

import { Roles } from '@constants/constants';
import { AccessDeniedComponent } from '@components/access-denied/access-denied.component';
import { ComingSoonComponent } from '@components/coming-soon/coming-soon.component';
import { PageNotFoundComponent } from '@components/page-not-found/page-not-found.component';
import { DocumentAccessListComponent } from '@components/documents/document-access-list/document-access-list.component';
import { VerifyCustomerComponent } from '@components/verify-customer/verify-customer.component';
import { SubmissionThanksComponent } from '@components/submission-thanks/submission-thanks.component';
import { UnsubscribeComponent } from '@components/unsubscribe/unsubscribe.component';
import { LeadOverviewComponent } from '@components/lead/lead-overview/lead-overview.component';
import { VerifyUserComponent } from '@components/verify-user/verify-user.component';
import { VerifyLeadSourceComponent } from '@components/verify-lead-source/verify-lead-source.component';
import { AllThanksMessageComponent } from '@components/all-thanks-message/all-thanks-message.component';
import { VerifySyndicateComponent } from '@components/verify-syndicate/verify-syndicate.component';
import { SyndicateThanksMessageComponent } from '@components/syndicate-thanks-message/syndicate-thanks-message.component';
import { VerifyParticipantsComponent } from '@components/verify-participants/verify-participants.component';
import { VerifyLenderOfferComponent } from '@components/verify-lender-offer/verify-lender-offer.component';
import { DisclosuerLeadDetailComponent } from '@components/disclosuer-lead-detail/disclosuer-lead-detail.component';
import { DisclosureThanxMessageComponent } from '@components/disclosure-thanx-message/disclosure-thanx-message.component';
import { VerifyHubSignComponent } from '@components/verify-hub-sign/verify-hub-sign.component';
import { HubSignComponent } from '@components/hub-sign/hub-sign.component';
import { VerifyAffilateLinkLeadComponent } from '@components/verify-affilate-link-lead/verify-affilate-link-lead.component';
import { CreateLeadAffilateLinkComponent } from '@components/create-lead-affilate-link/create-lead-affilate-link.component';
import { CreateContractHubSignUpdateComponent } from '@components/create-contract-hub-sign-update/create-contract-hub-sign-update.component';
const routerOptions: ExtraOptions = {
    scrollPositionRestoration: "enabled",
    anchorScrolling: "enabled",
    scrollOffset: [0, 64]
  };

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },  
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'user-login', component: VerifyUserComponent },
    { path: 'new-password', component: ResetPasswordComponent },
    { path: 'access-denied', component: AccessDeniedComponent },
    { path: 'document-access', component: DocumentAccessListComponent },
    { path: 'coming-soon', component: ComingSoonComponent },
    { path: 'unsubscribe', component: UnsubscribeComponent },
    { path: 'lead-overview', component: LeadOverviewComponent },
    {path:'disclosure-lead-detail',component:DisclosuerLeadDetailComponent},
    { path: 'verify-customer/:token', component: VerifyCustomerComponent },
    { path: 'verify-customers', component: VerifyCustomerComponent },
    { path: 'verify-lead-source/:token', component: VerifyLeadSourceComponent },
    { path: 'verify-syndicate/:token', component: VerifySyndicateComponent },
    { path: 'verify-participant/:token', component: VerifyParticipantsComponent },
    { path: 'verify-lender-offer/:token', component: VerifyLenderOfferComponent },
    { path: 'lead-submitted/:id', component: SubmissionThanksComponent },
    { path: 'thanx-message', component: DisclosureThanxMessageComponent },
    { path: 'submitted/:id', component: AllThanksMessageComponent },
    { path: 'syndicate-submitted/:id', component: SyndicateThanksMessageComponent },
    { path: 'verify-hub-sign/:token', component: VerifyHubSignComponent },
    { path: 'hub-sign-update', component: HubSignComponent },
    { path: 'verify-affilate-link/:token', component: VerifyAffilateLinkLeadComponent },
    { path: 'create-lead-affilate-link', component: CreateLeadAffilateLinkComponent },
    { path: 'create-contract-hub-sign', component: CreateContractHubSignUpdateComponent },  
    { path: 'admin',  loadChildren: () => import('@modules/user/user.module').then(m => m.UserModule), data: { role: Roles.ADMINISTRATOR }, canLoad: [PermissionGuard]},
    { path: 'company',  loadChildren: () => import('@modules/company/company.module').then(m => m.CompanyModule), data: { role: Roles.COMPANY }, canLoad: [PermissionGuard]},
    // { path: 'submitter',  loadChildren: () => import('@modules/submitter/submitter.module').then(m => m.SubmitterModule), data: { role: Roles.SUBMITTER }, canLoad: [PermissionGuard]},
    // { path: 'under-writter',  loadChildren: () => import('@modules/under-writter/under-writter.module').then(m => m.UnderWritterModule), data: { role: Roles.UNDERWRITER }, canLoad: [PermissionGuard]},
    // { path: 'branchmanager',  loadChildren: () => import('@modules/branch-manager/branch-manager.module').then(m => m.BranchManagerModule), data: { role: Roles.BRANCHMANAGER }, canLoad: [PermissionGuard]},
    { path: ':role',  loadChildren: () => import('@modules/under-writter/under-writter.module').then(m => m.UnderWritterModule), data: { role: Roles.UNDERWRITER }},
    { path: '**', component: PageNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, routerOptions)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
