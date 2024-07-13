import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DOCUMENT, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex, Roles, Mask, SETTINGS } from '@constants/constants';
import { NgbAccordion } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { MapsAPILoader } from '@agm/core';
import * as Constants from '@constants/constants';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import moment from 'moment';

export let placeAddresCompoponent = {
    ZIP_CODE: 'postal_code',
    COUNTRY: 'country',
    STATE: 'administrative_area_level_1',
    // CITY: 'administrative_area_level_2',
    CITY: 'locality',
    TOWN: 'sublocality_level_1',
    AREA: 'sublocality_level_2',
    NEAREST_ROAD: 'route'
}

@Component({
    selector: 'app-view-edit-syndicate',
    templateUrl: './view-edit-syndicate.component.html',
    styleUrls: ['./view-edit-syndicate.component.scss']
})
export class ViewEditSyndicateComponent implements OnInit {

    //     addUserForm!: FormGroup;
    //     countriesList: Array<any> = [];
    //     statesList: Array<any> = [];
    //     rolesList: Array<any> = [];
    //     mask = Mask;
    //     maxDate!: NgbDateStruct;
    //     filesForm!: FormGroup;
    //     selectedFiles: any[] = [];
    //     uploading: boolean = false;
    //     editMode: boolean = false;
    //     syndicateID: string = '';
    //     syndicateDetails: any = {};
    //     documentsList: Array<any> = [];
    //     todayDate: string = '';

    //     @ViewChild('dob',) DOB!: ElementRef;
    //     style!: { fill: any; };
    //     background!: { background: any; };
    //     colorSubs!: Subscription;
    //     isApiLoaded = false;
    //     @Input() options: Object = {};
    //     @ViewChild("placesRef") placesRef!: GooglePlaceDirective;
    //     stateId: string = ''
    //     countryIndex!: number

    //     constructor(
    //         private fb: FormBuilder,
    //         private apiService: ApiService,
    //         private commonService: CommonService,
    //         private router: Router,
    //         private el: ElementRef,
    //         private calendar: NgbCalendar,
    //         private route: ActivatedRoute,
    //         private formatter: NgbDateParserFormatter,
    //         private authService: AuthService,
    //         private mapsAPILoader: MapsAPILoader,
    //         @Inject(DOCUMENT) private document: Document,
    //         private elementRef: ElementRef
    //     ) { }

    //     ngOnInit(): void {
    //         this.initAddUserForm();
    //         this.getUserDetails();
    //         this.getCountries();
    //         // this.maxDate = this.calendar.getToday();
    //         let d = new Date();
    //         let day: any = d.getDate();
    //         if (day.toString().length < 2) {
    //             day = '0' + day;
    //         }
    //         this.todayDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
    //         // this.todayDate = `${d.getMonth() + 1}-${day}-${d.getFullYear()}`
    //         this.initForm();
    //         let params = this.route.snapshot.params;
    //         let query = this.route.snapshot.queryParams;
    //         if (params['id']) {
    //             this.syndicateID = params['id'];
    //             this.getSyndicateDetails();
    //         }
    //         if (query['mode'] && query['mode'] === 'edit') {
    //             this.editMode = true;
    //         }
    //         this.options = {
    //             types: ['hospital', 'pharmacy', 'bakery', 'country', 'places'],
    //             componentRestrictions: { country: 'IN' }
    //         }
    //         this.mapsAPILoader.load().then(() => {
    //             this.isApiLoaded = true
    //         })

    //     }

    //     loadScript() {
    //         return new Promise((resolve, reject) => {
    //             const element = this.document.createElement('script');
    //             element.type = 'text/javascript';
    //             element.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC347uiAl8KsmriRUu8X2XqsUPx-WW7Ep4&libraries=places&language=en';
    //             element.onload = resolve;
    //             element.onerror = reject;
    //             this.elementRef.nativeElement.appendChild(element);
    //         })
    //     }
    //     handleAddressChange(address: Address) {
    //         this.getAddressComponent(address.address_components, placeAddresCompoponent.ZIP_CODE)
    //         this.getAddressComponent(address.address_components, placeAddresCompoponent.COUNTRY)
    //         this.getAddressComponent(address.address_components, placeAddresCompoponent.CITY)
    //         this.getAddressComponent(address.address_components, placeAddresCompoponent.STATE)
    //         this.addUserForm.patchValue({
    //             address: address.name
    //         })
    //     }
    //     getAddressComponent(address_components: any, key: any) {
    //         var value = '';
    //         var shortvalue = '';
    //         var postalCodeType = address_components.filter((aComp: { types: any[]; }) =>
    //             aComp.types.some((typesItem: any) => typesItem === key))
    //         if (postalCodeType != null && postalCodeType?.length > 0)
    //             value = postalCodeType[0].long_name,
    //                 shortvalue = postalCodeType[0].short_name;
    //         if (key == 'postal_code') {
    //             this.addUserForm.patchValue({
    //                 zip_code: value
    //             })
    //         } else if (key == 'country') {
    //             let i = this.countriesList.findIndex((e) => e.short_code === shortvalue);
    //             if (i > -1) {
    //                 this.addUserForm.get('country_id')?.patchValue(this.countriesList[i].id);
    //                 this.countryIndex = i
    //             }
    //         } else if (key == 'administrative_area_level_1') {
    //             this.getStates(this.countriesList[this.countryIndex].id, value);

    //         } else if (key == 'locality') {
    //             this.addUserForm.patchValue({
    //                 city: value
    //             })
    //         }
    //         //  else if (key == 'administrative_area_level_2') {
    //         //     this.addUserForm.patchValue({
    //         //         city: value
    //         //     })
    //         // }
    //         return value;
    //     }
    //     /**
    // * @description get countries list
    // * @author Shine Dezign Infonet Pvt. Ltd.
    // */
    //     async getCountries() {
    //         try {
    //             this.commonService.showSpinner();
    //             const res$ = this.apiService.getReq(API_PATH.COUNTRIES_LIST, '', '');
    //             let response = await lastValueFrom(res$);
    //             if (response && response.data) {
    //                 this.countriesList = response.data;
    //                 let i = this.countriesList.findIndex((e) => e.name === "United States");
    //                 if (i > -1) {
    //                     this.addUserForm.get('country_id')?.patchValue(this.countriesList[i].id);
    //                     this.getStates(this.countriesList[i].id, '');
    //                 }
    //             }
    //             this.commonService.hideSpinner();
    //         } catch (error: any) {
    //             this.commonService.hideSpinner();
    //             if (error.error && error.error.message) {
    //                 this.commonService.showError(error.error.message);
    //             } else {
    //                 this.commonService.showError(error.message);
    //             }
    //         }
    //     }

    //     async getStates(country_id: string, value: any) {
    //         try {
    //             this.commonService.showSpinner();
    //             const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
    //             let response = await lastValueFrom(res$);
    //             if (response && response.data) {
    //                 this.statesList = response.data;
    //                 // this.addUserForm.patchValue({ state_id: "" });
    //                 if (value == '') {
    //                     this.addUserForm.patchValue({ state_id: "" });
    //                 } else {
    //                     setTimeout(() => {
    //                         let i = this.statesList.findIndex((e: any) => e.name == value);
    //                         if (i > -1) {
    //                             this.stateId = this.statesList[i].id
    //                             this.addUserForm.patchValue({ state_id: this.stateId });

    //                         }
    //                     })
    //                 }
    //             }
    //             this.commonService.hideSpinner();
    //         } catch (error: any) {
    //             this.commonService.hideSpinner();
    //             if (error.error && error.error.message) {
    //                 this.commonService.showError(error.error.message);
    //             } else {
    //                 this.commonService.showError(error.message);
    //             }
    //         }
    //     }
    //     getUserDetails(): void {
    //         try {
    //             let ud = this.authService.getUserDetails();
    //             if (ud) {
    //                 this.getColorOnUpdate();
    //                 this.style = { fill: ud?.color };
    //                 // this.color=ud?.color;
    //                 // this.stroke={stroke:ud?.color};
    //                 this.background = { background: ud?.color };

    //             }
    //         } catch (error: any) {
    //             this.commonService.showError(error.message);
    //         }
    //     }
    //     getColorOnUpdate() {
    //         this.colorSubs = this.authService.getColor().subscribe((u) => {
    //             this.getUserDetails();
    //         });
    //     }
    //     ngAfterViewInit(): void {
    //         if (this.DOB) {
    //             Inputmask('datetime', {
    //                 inputFormat: 'mm-dd-yyyy',
    //                 placeholder: 'mm-dd-yyyy',
    //                 alias: 'datetime',
    //                 min: '01-01-1920',
    //                 max: this.todayDate,
    //                 clearMaskOnLostFocus: false,
    //             }).mask(this.DOB.nativeElement);
    //         }
    //     }
    //     changeSyndicateFee(value: any) {
    //         if (Number(value) > 100) {
    //             this.commonService.showError("Please enter value less than or equal to 100")
    //             this.addUserForm.patchValue({ syndication_fee: '' })
    //         }
    //     }
    //     changeManagementFee(value: any) {
    //         if (Number(value) > 100) {
    //             this.commonService.showError("Please enter value less than or equal to 100")
    //             this.addUserForm.patchValue({ management_fee: '' })
    //         }
    //     }
    //         /**
    //  * @description get states on country change
    //  * @param countryId 
    //  * @author Shine Dezign Infonet Pvt. Ltd.
    //  * @returns {void}
    //  */
    //          onCountryChange(countryId: any): void {
    //             this.getStates(countryId, '');
    //         }




    //     /**
    //      * @description get form controls
    //      * @author Shine Dezign Infonet Pvt. Ltd.
    //      */
    //     get f(): { [key: string]: AbstractControl } {
    //         return this.addUserForm.controls;
    //     }


    //     /**
    //      * @description initialize add compnay form
    //      * @author Shine Dezign Infonet Pvt. Ltd.
    //      * @returns {void}
    //      */
    //     initAddUserForm(): void {
    //         this.addUserForm = this.fb.group({
    //             name: ['', [
    //                 Validators.required,
    //                 Validators.pattern(Custom_Regex.spaces),
    //                 Validators.pattern(Custom_Regex.lettersOnly),
    //                 Validators.maxLength(100),
    //                 Validators.minLength(3)
    //             ]],
    //             email: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
    //             phone_number: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
    //             status: ['1', [Validators.required]],
    //             syndication_fee: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
    //             management_fee: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
    //             mpa_signed_date: ['', [Validators.required]],
    //             address: ['', [
    //                 Validators.pattern(Custom_Regex.spaces),
    //                 // Validators.pattern(Custom_Regex.address2),
    //                 Validators.maxLength(200),
    //                 //   Validators.minLength(3),
    //             ]],
    //             other_address: ['', [
    //                 Validators.pattern(Custom_Regex.spaces),
    //                 Validators.pattern(Custom_Regex.address2),
    //                 Validators.maxLength(200),
    //                 //   Validators.minLength(3),
    //             ]],
    //             city: ['', [
    //                 Validators.pattern(Custom_Regex.spaces),
    //                 // Validators.pattern(Custom_Regex.city), 
    //                 // Validators.pattern(Custom_Regex.name),
    //                 Validators.maxLength(100),
    //                 // Validators.minLength(3),
    //             ]],
    //             state_id: [''],
    //             country_id: [''],
    //             zip_code: [''],
    //             ein: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
    //             bank_reference_name: ['', [Validators.pattern(Custom_Regex.spaces)]],
    //             routing_number: ['', [Validators.pattern(Custom_Regex.amount)]],
    //             account_number: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
    //             report_email: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.EMAIL_REGEX_COMMA_SEPRATED),]],

    //         })
    //     }

    //     addFileToForm(file: File) {
    //         this.formFileArray.push(this.fb.group({
    //             fileName: [file.name],
    //             doc_name: ['', [
    //                 Validators.required,
    //                 Validators.pattern(Custom_Regex.spaces),
    //                 Validators.pattern(Custom_Regex.username),
    //                 Validators.pattern(Custom_Regex.name),
    //                 Validators.maxLength(100),
    //                 Validators.minLength(3)
    //             ]],
    //             file: [file]
    //         }))
    //     }

    //     initForm() {
    //         this.filesForm = this.fb.group({
    //             files: this.fb.array([])
    //         })
    //     }

    //     get formFileArray() {
    //         return this.filesForm.get('files') as FormArray;
    //     }
    //     removeFileFromArray(i: number) {
    //         this.formFileArray.removeAt(i);
    //     }

    //     async downloadFile(doc: any) {
    //         try {
    //             this.commonService.showSpinner();
    //             const res$ = this.apiService.postReq(API_PATH.DOWNLOAD_FILE, { file: doc.actual_name }, 'lead', 'list', 'arraybuffer');
    //             const response = await lastValueFrom(res$);
    //             const arrayBufferView = new Uint8Array(response);
    //             const file = new Blob([arrayBufferView], { type: doc.document_type });
    //             let url = window.URL.createObjectURL(file);
    //             let a = document.createElement('a');
    //             document.body.appendChild(a);
    //             a.setAttribute('style', 'display: none');
    //             a.href = url;
    //             a.download = doc.actual_name;
    //             a.click();
    //             window.URL.revokeObjectURL(url);
    //             a.remove();
    //             this.commonService.hideSpinner();
    //         } catch (error) {
    //             this.commonService.hideSpinner();
    //             this.commonService.showErrorMessage(error)
    //         }
    //     }

    //     /**
    //  * 
    //  * @param files 
    //  */
    //     onFileChange(files: File[], input: any) {
    //         this.selectedFiles = [];
    //         for (let i = 0; i < files.length; i++) {
    //             if (files[i].size / 1024 / 1024 > 10) {
    //                 this.commonService.showError('Maximum file size allowed is 10MB');
    //             } else if (!SETTINGS.ALLOWED_FILES.includes(files[i].type)) {
    //                 this.commonService.showError('Invalid file type. Allowed file type are - gif|jpeg|png|txt|doc|docx|xlsx|xls|pdf|wav|mp3 ');
    //             } else {
    //                 this.addFileToForm(files[i])
    //             }
    //         }
    //         input.value = '';
    //     }
    //     async uploadDocuments() {
    //         try {
    //             this.uploading = true;
    //             let lead_id = '';
    //             if (this.formFileArray.length) {
    //                 // if (this.roles.ADMINISTRATOR === this.userRole) {
    //                 //     if (!this.company || !this.leadOfCompany) {
    //                 //         this.commonService.showError('Please select company and lead first.')
    //                 //         this.uploading = false;
    //                 //         return;
    //                 //     }
    //                 //     lead_id = this.leadOfCompany;
    //                 // } else {
    //                 //     if (!this.leadId) {
    //                 //         this.uploading = false;
    //                 //         this.commonService.showError('Please select lead first.')
    //                 //         return;
    //                 //     }
    //                 //     lead_id = this.leadId
    //                 // }
    //                 if (this.formFileArray.valid) {
    //                     const formData: FormData = new FormData();
    //                     for (let i = 0; i < this.formFileArray.value.length; i++) {
    //                         formData.append('document[]', this.formFileArray.value[i].file, this.formFileArray.value[i].fileName);
    //                         formData.append('name[]', this.formFileArray.value[i].doc_name);
    //                         formData.append('document_type[]', this.formFileArray.value[i].doc_type);
    //                     }
    //                     formData.append('lead_id', lead_id);

    //                     this.uploading = true;
    //                     this.commonService.showSpinnerWithId('uploading');
    //                     const res$ = this.apiService.postReq(API_PATH.UPLOAD_LEAD_DOC, formData, 'lead', 'edit');
    //                     const response = await lastValueFrom(res$);
    //                     if (response && response.status_code == "200") {
    //                         this.commonService.showSuccess(response.message);
    //                         this.uploading = false;
    //                         this.commonService.hideSpinnerWithId('uploading');
    //                         this.selectedFiles = [];
    //                         // this.search = '';
    //                         // this.page = 1;
    //                         // this.getDocsList();
    //                         this.formFileArray.clear();
    //                     } else {
    //                         this.uploading = false;
    //                         this.commonService.showError(response.message);
    //                         this.commonService.hideSpinnerWithId('uploading');
    //                     }
    //                 } else {
    //                     this.formFileArray.markAllAsTouched();
    //                     this.uploading = false;
    //                 }

    //             } else {
    //                 this.commonService.showError('No file selected.')
    //                 this.uploading = false;
    //             }
    //         } catch (error) {
    //             this.uploading = false;
    //             this.commonService.hideSpinnerWithId('uploading');
    //             this.commonService.hideSpinner();
    //             this.commonService.showErrorMessage(error);
    //         }
    //     }



    //     /**
    //      * @description on add company submit
    //      * @author Shine Dezign Infonet Pvt. Ltd.
    //      * @returns { Promise<void> }
    //      */
    //     async updateUserSubmit(): Promise<void> {
    //         this.addUserForm.markAllAsTouched();
    //         this.formFileArray.markAllAsTouched();
    //         if (!this.formFileArray.length && !this.documentsList.length) {
    //             this.commonService.showError('Please select any document');
    //             return;
    //         }

    //         if (this.addUserForm.valid && this.formFileArray.valid) {
    //             if (this.addUserForm.value.mpa_signed_date && !Custom_Regex.date.test(this.addUserForm.value.mpa_signed_date)) {
    //                 this.commonService.showError('Invalid mpa signed date.');
    //                 this.commonService.hideSpinner();
    //                 return;
    //             }

    //             try {
    //                 this.commonService.showSpinner();
    //                 const formData: FormData = new FormData();
    //                 formData.append('name', this.addUserForm.get('name')?.value);
    //                 formData.append('email', this.addUserForm.get('email')?.value);
    //                 formData.append('phone_number', this.addUserForm.get('phone_number')?.value),
    //                     formData.append('status', this.addUserForm.get('status')?.value);
    //                 formData.append('syndication_fee', this.addUserForm.get('syndication_fee')?.value);
    //                 formData.append('management_fee', this.addUserForm.get('management_fee')?.value);
    //                 formData.append('mpa_signed_date', this.addUserForm.value.mpa_signed_date ? this.addUserForm.value.mpa_signed_date : "");
    //                 formData.append('syndicate_id', this.syndicateID);
    //                 formData.append('address', this.addUserForm.get('address')?.value);
    //                 formData.append('other_address', this.addUserForm.get('other_address')?.value);
    //                 formData.append('city', this.addUserForm.get('city')?.value);
    //                 formData.append('state_id', this.addUserForm.get('state_id')?.value);
    //                 formData.append('country_id', this.addUserForm.get('country_id')?.value);
    //                 formData.append('zip_code', this.addUserForm.get('zip_code')?.value);
    //                 formData.append('ein', this.addUserForm.get('ein')?.value);
    //                 formData.append('bank_reference_name', this.addUserForm.get('bank_reference_name')?.value);
    //                 formData.append('routing_number', this.addUserForm.get('routing_number')?.value);
    //                 formData.append('account_number', this.addUserForm.get('account_number')?.value);
    //                 formData.append('report_email', this.addUserForm.get('report_email')?.value);
    //                 for (let i = 0; i < this.formFileArray.value.length; i++) {
    //                     formData.append('document[]', this.formFileArray.value[i].file, this.formFileArray.value[i].fileName);
    //                     formData.append('document_name[]', this.formFileArray.value[i].doc_name);
    //                 }
    //                 const res$ = this.apiService.postReq(API_PATH.UPDATE_SYNDICATE, formData, 'syndicate', 'update');
    //                 let response = await lastValueFrom(res$);
    //                 if (response) {
    //                     this.commonService.showSuccess(response.message);
    //                     this.router.navigate([`/${this.userBaseRoute}/syndicates`]);
    //                 }
    //                 this.commonService.hideSpinner();
    //             } catch (error: any) {
    //                 this.commonService.hideSpinner();
    //                 if (error.error && error.error.message) {
    //                     this.commonService.showError(error.error.message);
    //                 } else {
    //                     this.commonService.showError(error.message);

    //                 }
    //             }

    //         } else {
    //             this.focusInvalidField();
    //         }

    //     }
    //     async getSyndicateDetails(): Promise<void> {
    //         try {
    //             this.commonService.showSpinner();
    //             let data = {
    //                 id: this.syndicateID
    //             }
    //             const res$ = this.apiService.postReq(API_PATH.VIEW_SYNDICATE, data, 'syndicate', 'view');
    //             let response = await lastValueFrom(res$);
    //             if (response && response.data) {
    //                 this.syndicateDetails = response.data;
    //                 this.documentsList = response.data.documents;
    //                 if (this.syndicateDetails.country_id) {
    //                     this.addUserForm.patchValue({ country_id: this.syndicateDetails.country_id });
    //                     await this.getStates(this.syndicateDetails?.country_id, ''); 
    //                 } 

    //                 this.patchValues();

    //             }
    //             this.commonService.hideSpinner();
    //         } catch (error: any) {
    //             this.commonService.hideSpinner();
    //             if (error.error && error.error.message) {
    //                 this.commonService.showError(error.error.message);
    //             } else {
    //                 this.commonService.showError(error.message);
    //             }
    //         }
    //     }
    //     cancel() {
    //         this.editMode = !this.editMode;
    //         this.patchValues();
    //     }
    //     patchValues() {
    //         this.addUserForm.patchValue({
    //             name: this.syndicateDetails.name,
    //             email: this.syndicateDetails.email,
    //             phone_number: this.syndicateDetails.phone_number,
    //             status: this.syndicateDetails.status === 'Active' ? 1 : 0,
    //             syndication_fee: this.syndicateDetails.syndication_fee,
    //             management_fee: this.syndicateDetails.management_fee,
    //             mpa_signed_date: this.syndicateDetails.mpa_signed_date,
    //             address: this.syndicateDetails.address,
    //             other_address: this.syndicateDetails.other_address,
    //             city: this.syndicateDetails.city,
    //             // state_id: this.syndicateDetails.state_id,
    //             // country_id: this.syndicateDetails.country_id,
    //             zip_code: this.syndicateDetails.zip_code,
    //             ein: this.syndicateDetails.ein,
    //             bank_reference_name: this.syndicateDetails.bank_reference_name,
    //             routing_number: this.syndicateDetails.routing_number,
    //             account_number: this.syndicateDetails.account_number,
    //             report_email: this.syndicateDetails.report_email,

    //         })
    //         setTimeout(() => {
    //             this.addUserForm.patchValue({
    //                 state_id: this.syndicateDetails.state_id
    //               })
    //            })
    //     }
    //     opendocumentRemovepopup(id: any) {
    //         Swal.fire({
    //             title: 'Are you sure want to delete?',
    //             icon: 'warning',
    //             showCancelButton: true,
    //             confirmButtonText: 'Yes, delete it!',
    //             confirmButtonColor: "#f0412e",
    //             cancelButtonText: 'Cancel'
    //         }).then((result) => {
    //             if (result.value) {
    //                 this.deletesyndicateDocument(id);

    //             } else if (result.dismiss === Swal.DismissReason.cancel) {
    //                 Swal.close()
    //             }
    //         })

    //     }
    //     async deletesyndicateDocument(id: any) {
    //         try {
    //             let data = {
    //                 document_id: id
    //             }
    //             this.commonService.showSpinner();
    //             const res$ = await this.apiService.postReq(API_PATH.SYNDICATE_DOCUMENT_DELETE, data, 'syndicate', 'delete')
    //             const response = await lastValueFrom(res$);
    //             if (response && response.status_code == "200") {
    //                 this.commonService.showSuccess(response.message);
    //                 this.documentsList = this.documentsList.filter(el => !id.includes(el.document_id));
    //                 //    this.documentsList = this.documentsList.filter((e) => e.id != id);
    //                 Swal.close();

    //             }
    //             this.commonService.hideSpinner();


    //         } catch (error: any) {
    //             this.commonService.hideSpinner();
    //             this.commonService.showError(error.error.message);
    //         }
    //     }

    //     /**
    //      * @description focus first invalid field
    //      */
    //     focusInvalidField() {
    //         const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
    //             ".form-group .ng-invalid"
    //         );
    //         if (firstInvalidControl)
    //             firstInvalidControl.focus();
    //     }
    //     get userBaseRoute() {
    //         return this.authService.getUserRole().toLowerCase();
    //     }


    // }

    @ViewChild('dob',) DOB!: ElementRef;
    role = Roles;
    tabView: boolean = true;
    userDetails: any = {};
    addUserForm!: FormGroup;
    countriesList: Array<any> = [];
    statesList: Array<any> = [];
    todayDate!: string;
    tabActive = {
        id: 'LeadDetails',
        number: 1
    }
    opentab: any;
    currentStep = 1;
    mask = Mask;
    leadSourceList: Array<any> = [];
    leadStatusList: Array<any> = [];
    @ViewChild('acc', { static: false }) accordion!: NgbAccordion;
    submitterTabIndex: number = 0;
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!: Subscription;
    color!: string;
    isApiLoaded = false;
    @Input() options: Object = {};
    @ViewChild("placesRef") placesRef!: GooglePlaceDirective;
    stateId: string = ''
    countryIndex!: number;
    userRole: string = ''
    companyID: String = '';
    passwordType: boolean = true;
    timezonesList: Array<any> = [];
    rolesList: Array<any> = [];
    selectedFiles: any[] = [];
    filesForm!: FormGroup | any;
    nowDate!: string;
    docTypes: any[] = [];
    previewData: any = {};
    uploading: boolean = false;
    uploadedDocsList: Array<any> = [];
    dateFormat: string = '';
    timeZone: string = '';
    entityType: Array<any> = [];
    syndicateID: string = '';
    syndicateDetails: any = {};
    companyType: string = ''

    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private authService: AuthService,
        private loc: Location,
        private el: ElementRef,
        private mapsAPILoader: MapsAPILoader,
        @Inject(DOCUMENT) private document: Document,
        private elementRef: ElementRef,
        private ngxLoader: NgxUiLoaderService,
        private route: ActivatedRoute

    ) { }

    ngOnInit(): void {
        let d = new Date();
        let day: any = d.getDate();
        if (day.toString().length < 2) {
            day = '0' + day;
        }
        let month:string|number = (d.getMonth() + 1);
        if (month.toString().length < 2) {
            month = '0' + month;
        }
        this.todayDate = `${month}-${day}-${d.getFullYear()}`
        // this.todayDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
        // this.todayDate = `${d.getMonth() + 1}-${day}-${d.getFullYear()}`
        this.initAddUserForm();
        this.getUserDetails();
        this.initForm()
        this.getCountries();
        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        if (params['id']) {
            this.syndicateID = params['id'];
            this.getSyndicateDetails();
            this.getLeadSourceDocument();
        }
        this.options = {
            types: ['hospital', 'pharmacy', 'bakery', 'country', 'places'],
            componentRestrictions: { country: 'IN' }
        }
        this.mapsAPILoader.load().then(() => {
            this.isApiLoaded = true
        })
    }
    loadScript() {
        return new Promise((resolve, reject) => {
            const element = this.document.createElement('script');
            element.type = 'text/javascript';
            element.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC347uiAl8KsmriRUu8X2XqsUPx-WW7Ep4&libraries=places&language=en';
            element.onload = resolve;
            element.onerror = reject;
            this.elementRef.nativeElement.appendChild(element);
        })
    }
    handleAddressChange(address: Address) {
        this.getAddressComponent(address.address_components, placeAddresCompoponent.ZIP_CODE)
        this.getAddressComponent(address.address_components, placeAddresCompoponent.COUNTRY)
        this.getAddressComponent(address.address_components, placeAddresCompoponent.CITY)
        this.getAddressComponent(address.address_components, placeAddresCompoponent.STATE)
        this.addUserForm.patchValue({
            address: address.name
        })
    }
    getAddressComponent(address_components: any, key: any) {
        var value = '';
        var shortvalue = '';
        var postalCodeType = address_components.filter((aComp: { types: any[]; }) =>
            aComp.types.some((typesItem: any) => typesItem === key))
        if (postalCodeType != null && postalCodeType.length > 0)
            value = postalCodeType[0].long_name,
                shortvalue = postalCodeType[0].short_name;
        if (key == 'postal_code') {
            this.addUserForm.patchValue({
                zip_code: value
            })

        } else if (key == 'country') {
            let i = this.countriesList.findIndex((e) => e.short_code === shortvalue);
            if (i > -1) {
                this.addUserForm.get('country_id')?.patchValue(this.countriesList[i].id);
                this.countryIndex = i

            }
        } else if (key == 'administrative_area_level_1') {
            this.getStates(this.countriesList[this.countryIndex].id, value);
        } else if (key == 'locality') {
            this.addUserForm.patchValue({
                city: value
            })
        }
        return value;
    }


    async getSyndicateDetails(): Promise<void> {
        try {
            this.commonService.showSpinner();
            let data = {
                id: this.syndicateID
            }
            const res$ = this.apiService.postReq(API_PATH.VIEW_SYNDICATE, data, 'syndicate', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.syndicateDetails = response.data;
                // this.documentsList = response.data.documents;
                if (this.syndicateDetails.country_id) {
                    this.addUserForm.patchValue({ country_id: this.syndicateDetails.country_id });
                    await this.getStates(this.syndicateDetails?.country_id, '');
                }

                this.patchValues();

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

    patchValues() {
        this.addUserForm.patchValue({
            first_name: this.syndicateDetails.first_name,
            last_name: this.syndicateDetails.last_name,
            company_name: this.syndicateDetails.company_name,
            email: this.syndicateDetails.email,
            optional_email: this.syndicateDetails.optional_email,
            phone_number: this.syndicateDetails.phone_number,
            status: this.syndicateDetails.status === 'Active' ? 1 : 0,
            syndication_fee: this.syndicateDetails.syndication_fee,
            management_fee: this.syndicateDetails.management_fee,
            mpa_signed_date: this.syndicateDetails.mpa_signed_date,
            title: this.syndicateDetails.title,
            address: this.syndicateDetails.address,
            other_address: this.syndicateDetails.other_address,
            city: this.syndicateDetails.city,
            // state_id: this.syndicateDetails.state_id,
            // country_id: this.syndicateDetails.country_id,
            zip_code: this.syndicateDetails.zip_code,
            ein: this.syndicateDetails.ein,
            bank_reference_name: this.syndicateDetails.bank_reference_name,
            routing_number: this.syndicateDetails.routing_number,
            account_number: this.syndicateDetails.account_number,
            report_email: this.syndicateDetails.report_email,
            send_mpa:this.syndicateDetails.send_mpa

        })
        this.previewData.path = this.syndicateDetails.path;
        this.previewData.document_name = this.syndicateDetails.document_name;
        this.previewData.document_type = this.syndicateDetails.document_type;
        this.previewData.document = this.syndicateDetails.document;
        this.previewData.actual_name  = this.syndicateDetails.actual_name;
        this.previewData.download_path  = this.syndicateDetails.download_path;
        setTimeout(() => {
            this.addUserForm.patchValue({
                state_id: this.syndicateDetails.state_id
            })
        })
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.inintMPAsign();
        })
        if (this.placesRef?.options) {
            this.placesRef.options.componentRestrictions = { country: 'SG' }
            this.placesRef.options.fields = ["formatted_address", "geometry", "place_id"]
        }


    }
    inintMPAsign() {
        if (this.DOB) {
            Inputmask('datetime', {
                inputFormat: 'mm-dd-yyyy',
                placeholder: 'mm-dd-yyyy',
                alias: 'datetime',
                min: '01-01-1920',
                max: this.todayDate,
                clearMaskOnLostFocus: false,
            }).mask(this.DOB.nativeElement);
        }
    }

    /**
     * @description back button
     */
    goBack() {
        this.loc.back();
    }

    validateTabChange(number: number, id: string) {
        setTimeout(() => {
            this.inintMPAsign();
        })
        try {
            if (number > this.submitterTabIndex + 1) return;

            this.tabActive = {
                id: id,
                number: number
            }
        } catch (error: any) {
            console.log(error.message);
        }
    }

    /**
     * @description get logged in user details
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
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
            // this.stroke={stroke:ud?.color};

            this.background = { background: ud?.color };
        }
    }

    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }

    initAddUserForm(): void {
        this.addUserForm = this.fb.group({
            first_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.maxLength(100),
                // Validators.minLength(3)
            ]],
            last_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.lettersOnly),
                Validators.maxLength(100),
                // Validators.minLength(3)
            ]],
            company_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                // Validators.minLength(3)
            ]],
            email: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
            optional_email: ['', [Validators.pattern(Custom_Regex.EMAIL_REGEX_COMMA_SEPRATED)]],
            phone_number: ['', [Validators.required, Validators.pattern(Custom_Regex.digitsOnly)]],
            status: ['1', [Validators.required]],
            syndication_fee: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            management_fee: ['', [Validators.required, Validators.pattern(Custom_Regex.amount)]],
            mpa_signed_date: [''],
            title:[''],
            address: ['', [
                Validators.pattern(Custom_Regex.spaces),
                // Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200),
                //   Validators.minLength(3),
            ]],
            other_address: ['', [
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.address2),
                Validators.maxLength(200),
                //   Validators.minLength(3),
            ]],
            city: ['', [
                Validators.pattern(Custom_Regex.spaces),
                // Validators.pattern(Custom_Regex.city), 
                // Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                // Validators.minLength(3),
            ]],
            state_id: [''],
            country_id: [''],
            zip_code: [''],
            ein: [''],
            bank_reference_name: ['', [Validators.pattern(Custom_Regex.spaces)]],
            routing_number: ['', [Validators.pattern(Custom_Regex.amount)]],
            account_number: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            send_mpa:[false],
            report_email: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.EMAIL_REGEX_COMMA_SEPRATED),]],

        })
    }

    /**
     * @description get lead detail form controls
     */
    get f(): { [key: string]: AbstractControl } {
        return this.addUserForm.controls;
    }


    async downloadFile(doc: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DOWNLOAD_FILE, { file: doc.actual_name }, 'lead', 'list', 'arraybuffer');
            const response = await lastValueFrom(res$);
            const arrayBufferView = new Uint8Array(response);
            const file = new Blob([arrayBufferView], { type: doc.document_type  });
            let url = window.URL.createObjectURL(file);
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
            if(this.companyType == 'funded'){
                a.download = doc.actual_name;
            }else{
                a.download = doc.download_path;
            }
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

    // async downloadFile(doc: any) {
    //     try {
    //         this.commonService.showSpinner();
    //         const res$ = this.apiService.postReq(API_PATH.DOWNLOAD_FILE, { file: doc.document_name }, 'lead', 'list', 'arraybuffer');
    //         const response = await lastValueFrom(res$);
    //         const arrayBufferView = new Uint8Array(response);
    //         const file = new Blob([arrayBufferView], { type: doc.document_type });
    //         let url = window.URL.createObjectURL(file);
    //         let a = document.createElement('a');
    //         document.body.appendChild(a);
    //         a.setAttribute('style', 'display: none');
    //         a.href = url;
    //         a.download = doc.document_name;
    //         a.click();
    //         window.URL.revokeObjectURL(url);
    //         a.remove();
    //         this.commonService.hideSpinner();
    //     } catch (error) {
    //         this.commonService.hideSpinner();
    //         this.commonService.showErrorMessage(error)
    //     }
    // }

    /**
     * @description focus first invalid field
     */
    focusInvalidField() {
        const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
            ".form-group .ng-invalid"
        );
        if (firstInvalidControl)
            firstInvalidControl.focus();
    }

    /**
     * @description open tab by ID
     * @param tabID 
     */
    openAccordianTab(tabID: string): void {

        this.changeDetectorRef.detectChanges();
        this.accordion.expand(tabID);
        this.inintMPAsign();
    }

    /**
     * @description close Accordian tab by id
     * @param tabID 
     */
    closeAccordianTab(tabID: string): void {
        this.accordion.collapse(tabID);
    }
    async onStepTwoSubmit() {
        this.getLeadSourceDocument();
        this.tabActive = {
            id: 'PartnerInfo',
            number: 3
        }
        if (this.submitterTabIndex < 2) {
            this.submitterTabIndex = 2;
        }
        this.changeDetectorRef.detectChanges();
    }


    closeAlltabs() {
        this.accordion.collapseAll();
    }

    
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    toggle(ID: string) {
        this.changeDetectorRef.detectChanges();

        setTimeout(() => {
            this.inintMPAsign();
        }, 0)
        setTimeout(() => this.accordion.toggle(ID), 0);
    }

    async onFinalStepSubmit() {
        this.filesForm.markAllAsTouched();
        if (this.filesForm.valid) {
            try {
                this.commonService.showSpinner();
                let reqData: any = {
                    syndicate_id: this.syndicateID
                }
                const res$ = this.apiService.postReq(API_PATH.SYNDICATE_EMAIL, reqData, 'syndicate', 'update');
                let response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/syndicates`]);
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
        } else {
            this.focusInvalidField();
        }

    }
    get getUserRole() {
        return this.authService.getUserRole().toLowerCase();
    }

    onCountryChange(countryId: any): void {
        this.getStates(countryId, '');

    }
    /**
    * @description get countries list
    * @author Shine Dezign Infonet Pvt. Ltd.
    */
    async getCountries() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.COUNTRIES_LIST, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.countriesList = response.data;
                let i = this.countriesList.findIndex((e) => e.name === "United States");
                if (i > -1) {
                    this.addUserForm.get('country_id')?.patchValue(this.countriesList[i].id);
                    this.getStates(this.countriesList[i].id, '');
                }
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
    async getStates(country_id: string, value: any) {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.STATES, { country_id: country_id }, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.statesList = response.data;
                this.addUserForm.patchValue({ state_id: "" });
                if (value != '') {
                    setTimeout(() => {
                        let i = this.statesList.findIndex((e: any) => e.name == value);
                        if (i > -1) {
                            this.stateId = this.statesList[i].id;
                            this.addUserForm.patchValue({ state_id: this.stateId });

                        }
                    })


                }
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

    initForm() {
        this.filesForm = this.fb.group({
            files: this.fb.array([])
        })
    }
    //
    addFileToForm(file: File) {
        this.formFileArray.push(this.fb.group({
            fileName: [file.name],
            doc_type: [''],
            doc_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                // Validators.minLength(3)
            ]],
            file: [file],

        }))
    }
    get formFileArray() {
        return this.filesForm.get('files') as FormArray;
    }
    removeFileFromArray(i: number) {
        this.formFileArray.removeAt(i);
    }
    onFileChange(files: File[], input: any) {
        this.selectedFiles = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].size / 1024 / 1024 > 30) {
                this.commonService.showError('Maximum file size allowed is 30MB');
            } else if (!SETTINGS.ALLOWED_FILES.includes(files[i].type)) {
                this.commonService.showError('Invalid file type. Allowed file type are - gif|jpeg|png|txt|doc|docx|xlsx|xls|pdf|wav|mp3 ');
            } else {
                this.addFileToForm(files[i])
            }
        }
        input.value = '';
    }

    docsType(value: any, i: any) {
        this.filesForm.get('files')['controls'][i].controls.doc_name.setValidators([
            Validators.required,
            Validators.pattern(Constants.Custom_Regex.spaces),
            // Validators.minLength(3),
            Validators.maxLength(100),
            Validators.pattern(Constants.Custom_Regex.username),
            Validators.pattern(Constants.Custom_Regex.name)
        ]);
        this.filesForm.get('files')['controls'][i].controls.doc_name.updateValueAndValidity();

    }
    async uploadDocuments() {
        try {
            this.uploading = true;
            if (this.formFileArray.length) {
                for (let i = 0; i < this.formFileArray.length; i++) {
                    this.filesForm.get('files')['controls'][i].controls.doc_name.setValidators([Validators.required, Validators.pattern(Constants.Custom_Regex.spaces),
                    // Validators.minLength(3),
                    Validators.maxLength(100),
                    Validators.pattern(Constants.Custom_Regex.username),
                    Validators.pattern(Constants.Custom_Regex.name)
                    ]);
                    this.filesForm.get('files')['controls'][i].controls.doc_name.updateValueAndValidity();
                    this.filesForm.get('files')['controls'][i].controls.doc_name.markAsTouched();


                }
                if (this.formFileArray.valid) {
                    const formData: FormData = new FormData();
                    for (let i = 0; i < this.formFileArray.value.length; i++) {
                        formData.append('document[]', this.formFileArray.value[i].file, this.formFileArray.value[i].fileName);
                        formData.append('document_name[]', this.formFileArray.value[i].doc_name);
                    }
                    formData.append('syndicate_id', this.syndicateID);
                    this.uploading = true;
                    this.ngxLoader.startLoader('loader1');

                    const res$ = this.apiService.postReq(API_PATH.SYNDICATE_DOCUMENT_UPLOAD, formData, 'syndicate', 'update');
                    const response = await lastValueFrom(res$);
                    if (response && response.status_code == "200") {
                        this.commonService.showSuccess(response.message);
                        this.uploading = false;
                        this.ngxLoader.stopLoader('loader1');

                        this.formFileArray.clear();
                        this.getLeadSourceDocument();
                        // this.getPendingDocs();

                    } else {
                        this.uploading = false;
                        this.commonService.showError(response.message);
                        this.ngxLoader.stopLoader('loader1');

                    }
                } else {
                    this.formFileArray.markAllAsTouched();
                    this.uploading = false;
                }
            } else {
                this.commonService.showError('No file selected.')
                this.uploading = false;
            }
        } catch (error: any) {
            this.uploading = false;
            this.ngxLoader.stopLoader('loader1');

            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    openFile(value: any) {
        // window.location.href = value;
        var a = document.createElement('a');
        a.target = "_blank";
        a.href = value;
        a.click();
    }

    async getLeadSourceDocument() {
        try {
            this.commonService.showSpinner();
            let url = `?records_per_page=${'1000'}&page=${'1'}&syndicate_id=${this.syndicateID}`;
            // let reqData: any = {
            //     page: 1,
            //     records_per_page: 1000,
            //     syndicate_id: this.syndicateID
            // }

            const res$ = this.apiService.getReq(API_PATH.SYNDICATE_UPLOADED_DOCUMENTS_LIST + url, 'syndicate', 'update');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.uploadedDocsList = response.data.documents;
                // for (let i = 0; i < this.uploadedDocsList.length; i++) {
                //     if (this.uploadedDocsList[i].document_type != 'other') {
                //         this.docTypes = this.docTypes.filter(e => e.value != this.uploadedDocsList[i].document_type)
                //     }
                // }
            } else {
                this.uploadedDocsList = [];
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
    leadDetailsLink(url1: any) {
        const url = url1;
        window.open(url, '_blank')
    }

    getDate(date: any) {
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
     }

    async documentsDelete(id: any): Promise<void> {
        let reqData: any = {
            document_id: id
        }
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.SYNDICATE_DOCUMENT_DELETE, reqData, 'syndicate', 'update');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.uploadedDocsList = this.uploadedDocsList.filter((e) => e.document_id != id);
                this.commonService.showSuccess(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error.error && error.error.message) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
            // }
        }

    }
    changeSyndicateFee(value: any) {
        if (Number(value) > 100) {
            this.commonService.showError("Please enter value less than or equal to 100")
            this.addUserForm.patchValue({ syndication_fee: '' })
        }
    }
    changeManagementFee(value: any) {
        if (Number(value) > 100) {
            this.commonService.showError("Please enter value less than or equal to 100")
            this.addUserForm.patchValue({ management_fee: '' })
        }
    }

    async addUserSubmit(): Promise<void> {
        this.addUserForm.markAllAsTouched();
        // this.formFileArray.markAllAsTouched();
        // if (!this.formFileArray.length) {
        //     this.commonService.showError('Please select any document')
        // }
        // && this.formFileArray.length && this.formFileArray.valid

        if (this.addUserForm.valid) {
            if (this.addUserForm.value.mpa_signed_date && !Custom_Regex.date.test(this.addUserForm.value.mpa_signed_date)) {
                this.commonService.showError('Invalid mpa signed date.');
                this.commonService.hideSpinner();
                return;
            }
            try {
                this.commonService.showSpinner();
                const formData: FormData = new FormData();
                formData.append('first_name', this.addUserForm.get('first_name')?.value);
                formData.append('last_name', this.addUserForm.get('last_name')?.value);
                formData.append('company_name', this.addUserForm.get('company_name')?.value);
                formData.append('email', this.addUserForm.get('email')?.value);
                formData.append('optional_email', this.addUserForm.get('optional_email')?.value);
                formData.append('phone_number', this.addUserForm.get('phone_number')?.value),
                    formData.append('status', this.addUserForm.get('status')?.value);
                formData.append('syndication_fee', this.addUserForm.get('syndication_fee')?.value);
                formData.append('management_fee', this.addUserForm.get('management_fee')?.value);
                formData.append('mpa_signed_date', this.addUserForm.value.mpa_signed_date ? this.addUserForm.value.mpa_signed_date : "");
                formData.append('address', this.addUserForm.get('address')?.value);
                formData.append('other_address', this.addUserForm.get('other_address')?.value);
                formData.append('city', this.addUserForm.get('city')?.value);
                formData.append('title', this.addUserForm.get('title')?.value);
                formData.append('state_id', this.addUserForm.get('state_id')?.value);
                formData.append('country_id', this.addUserForm.get('country_id')?.value);
                formData.append('send_mpa', this.addUserForm.get('send_mpa')?.value);
                formData.append('zip_code', this.addUserForm.get('zip_code')?.value);
                formData.append('ein', this.addUserForm.get('ein')?.value);
                formData.append('bank_reference_name', this.addUserForm.get('bank_reference_name')?.value);
                formData.append('routing_number', this.addUserForm.get('routing_number')?.value);
                formData.append('account_number', this.addUserForm.get('account_number')?.value);
                formData.append('report_email', this.addUserForm.get('report_email')?.value);
                formData.append('syndicate_id', this.syndicateID);
                for (let i = 0; i < this.formFileArray.value.length; i++) {
                    formData.append('document[]', this.formFileArray.value[i].file, this.formFileArray.value[i].fileName);
                    formData.append('document_name[]', this.formFileArray.value[i].doc_name);
                }
                const res$ = this.apiService.postReq(API_PATH.UPDATE_SYNDICATE, formData, 'syndicate', 'update');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.previewData = response.data;
                    this.tabActive = {
                        id: 'OfficerInfo',
                        number: 2
                    }
                    if (this.submitterTabIndex < 1) {
                        this.submitterTabIndex = 1;
                    }
                    // this.router.navigate([`/${this.userBaseRoute}/syndicates`]);
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

        } else {
            this.focusInvalidField();
        }
    }
    // async onOfficerInfoSubmit() {
    //     this.getDocumentTypes();
    //     this.tabActive = {
    //         id: 'PartnerInfo',
    //         number: 3
    //     }
    //     if (this.submitterTabIndex < 2) {
    //         this.submitterTabIndex = 2;
    //     }
    //     this.changeDetectorRef.detectChanges();
    // }

}





