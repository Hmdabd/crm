import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthInterceptor } from './interceptor/auth.interceptor';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from "ngx-spinner";
import { DateFormatterDatepickerService } from '@services/date-formatter-datepicker.service'
//components
import { LoginComponent } from './components/on-boarding/login/login.component';
import { PageNotFoundComponent } from '@components/page-not-found/page-not-found.component';
import { ForgotPasswordComponent } from './components/on-boarding/forgot-password/forgot-password.component';
import { environment } from 'environments/environment';
import { ResetPasswordComponent } from './components/on-boarding/reset-password/reset-password.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { DocumentAccessListComponent } from '@components/documents/document-access-list/document-access-list.component';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { VerifyCustomerComponent } from '@components/verify-customer/verify-customer.component';
import { SubmissionThanksComponent } from './components/submission-thanks/submission-thanks.component';
import { NgxUiLoaderConfig, NgxUiLoaderModule, PB_DIRECTION, POSITION, SPINNER } from "ngx-ui-loader";
import { UnsubscribeComponent } from '@components/unsubscribe/unsubscribe.component';
import { UserIdleModule } from 'angular-user-idle';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { MomentModule } from 'angular2-moment';
import { VerifyUserComponent } from '@components/verify-user/verify-user.component';
import { VerifyLeadSourceComponent } from '@components/verify-lead-source/verify-lead-source.component';
import { VerifySyndicateComponent } from '@components/verify-syndicate/verify-syndicate.component';
import { VerifyParticipantsComponent } from '@components/verify-participants/verify-participants.component';
import { DisclosureThanxMessageComponent } from '@components/disclosure-thanx-message/disclosure-thanx-message.component';
import { VerifyHubSignComponent } from '@components/verify-hub-sign/verify-hub-sign.component';
import { NgxMaskModule } from 'ngx-mask';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { VerifyAffilateLinkLeadComponent } from '@components/verify-affilate-link-lead/verify-affilate-link-lead.component';
import { AgmCoreModule } from '@agm/core';



const ngxUiLoaderConfig: NgxUiLoaderConfig = {
    bgsColor: "red",
    bgsPosition: POSITION.topRight,
    bgsSize: 40,
    bgsType: SPINNER.ballSpinClockwiseFadeRotating, // background spinner type
    fgsType: SPINNER.doubleBounce, // foreground spinner type
    pbDirection: PB_DIRECTION.leftToRight, // progress bar direction
    pbThickness: 5, // progress bar thickness
    pbColor: "#fa5440",
    fgsColor: "#fa5440",
  };

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        PageNotFoundComponent,
        DocumentAccessListComponent,
        VerifyCustomerComponent,
        VerifyLeadSourceComponent,
        VerifySyndicateComponent,
        VerifyParticipantsComponent,
        SubmissionThanksComponent,
        UnsubscribeComponent,
        VerifyUserComponent,
        DisclosureThanxMessageComponent,
        VerifyHubSignComponent,
        VerifyAffilateLinkLeadComponent,
        // UserIdleModule.forRoot({idle: 600, timeout: 300, ping: 120})
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        ToastrModule.forRoot({
            preventDuplicates: true,
            positionClass :'toast-top-right'
        }),
        NgxSpinnerModule,
        SweetAlert2Module.forRoot(),
        NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
        UserIdleModule,
        NgIdleKeepaliveModule.forRoot(),
        MomentModule,
        NgxMaskModule.forRoot(),
        GooglePlaceModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyC347uiAl8KsmriRUu8X2XqsUPx-WW7Ep4',
            libraries: ['places']
          }),
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: 'baseURL', useValue: environment.baseURL },
        { provide: NgbDateParserFormatter, useClass: DateFormatterDatepickerService }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
