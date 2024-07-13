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
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import moment from 'moment';
import { NgxUiLoaderService } from 'ngx-ui-loader';

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
    selector: 'app-view-edit-lead-source',
    templateUrl: './view-edit-lead-source.component.html',
    styleUrls: ['./view-edit-lead-source.component.scss']
})
export class ViewEditLeadSourceComponent implements OnInit {
    role = Roles;
    tabView: boolean = true;
    userDetails: any = {};
    leadSouceForm!: FormGroup;
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
    leadSourceDetails: any = {};
    leadSourceId: string = '';
    previewData: any = {};
    uploading: boolean = false;
    // pendingDocs: Array<any> = [];
    uploadedDocsList: Array<any> = [];
    dateFormat: string = '';
    timeZone: string = '';
    entityType: Array<any> = [];
    companyType: string = '';

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
        private route: ActivatedRoute,
        private ngxLoader: NgxUiLoaderService,

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
        this.getCountries();
        // this.todayDate = `${((d.getMonth() + "1")).slice(-2)}-${day}-${d.getFullYear()}`
        let params = this.route.snapshot.params;
        let query = this.route.snapshot.queryParams;
        if (params['id'] || params['leadid']) {
            this.leadSourceId = params['id'];
            this.getLeadSourceDetails();

        }
        this.initleadSouceForm();
        this.getDocumentTypes();
        this.getLeadSourceDocument();
        this.getUserDetails();
        this.getTimeZones();
        this.getEntityOptions();
        // this.getRolesList();
        this.initForm()
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
        this.leadSouceForm.patchValue({
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
            this.leadSouceForm.patchValue({
                zip_code: value
            })

        } else if (key == 'country') {
            let i = this.countriesList.findIndex((e) => e.short_code === shortvalue);
            if (i > -1) {
                this.leadSouceForm.get('country_id')?.patchValue(this.countriesList[i].id);
                this.countryIndex = i

            }
        } else if (key == 'administrative_area_level_1') {
            this.getStates(this.countriesList[this.countryIndex].id, value);
        } else if (key == 'locality') {
            this.leadSouceForm.patchValue({
                city: value
            })
        }
        return value;
    }
    

    async getTimeZones() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_TIMEZONES, '', '');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.timezonesList = response.data;
                this.leadSouceForm.patchValue({ time_zone_id: this.timezonesList[0].id })

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
    patchValues() {
        // this.getStates(this.leadSourceDetails.country_id, this.leadSourceDetails.state_id)
        this.leadSouceForm.patchValue({
            name: this.leadSourceDetails.name,
            first_name: this.leadSourceDetails.first_name,
            last_name: this.leadSourceDetails.last_name,
            time_zone_id: this.leadSourceDetails.time_zone_id,
            email: this.leadSourceDetails.email,
            phone_number: this.leadSourceDetails.phone_number,
            role: this.leadSourceDetails.role,
            company_name: this.leadSourceDetails.company_name,
            address: this.leadSourceDetails.address,
            other_address: this.leadSourceDetails.other_address,
            zip_code: this.leadSourceDetails.zip_code,
            city: this.leadSourceDetails.city,
            country_id: this.leadSourceDetails.country_id,
            entity_type_id: this.leadSourceDetails.entity_type_id,
            // state_id: this.leadSourceDetails.state_id,
            ein: this.leadSourceDetails.ein,
            send_iso_agreement:this.leadSourceDetails.send_iso_agreement

        })
        this.previewData.path = this.leadSourceDetails.path;
        this.previewData.document_name = this.leadSourceDetails.document_name;
        this.previewData.document_type = this.leadSourceDetails.document_type;
        this.previewData.document = this.leadSourceDetails.document;
        this.previewData.actual_name  = this.leadSourceDetails.actual_name;
        this.previewData.download_path  = this.leadSourceDetails.download_path;
        setTimeout(() => { 
            this.leadSouceForm.patchValue({
                state_id: this.leadSourceDetails.state_id
            })
        })



    }

    async getEntityOptions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.DECLINE_OPTIONS, { group_name: ['entity_type'] }, 'ISO', 'update');
            const response = await lastValueFrom(res$);
            if (response && response.status_code === "200") {
                this.entityType = response.data.entity_type;
            } else {
                this.commonService.showError(response.message);
            }
            this.commonService.hideSpinner();
        } catch (error) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }
    async getLeadSourceDetails(): Promise<void> {
        try {
            let url = `?id=${this.leadSourceId}`;
            this.commonService.showSpinner();
            // let data = {
            //     id: this.leadSourceId
            // }
            const res$ = this.apiService.getReq(API_PATH.LEAD_SOURCE_VIEW + url, 'ISO', 'update');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadSourceDetails = response.data;
                await this.getStates(this.leadSourceDetails?.country_id, '');
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
    async getRolesList(): Promise<any> {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.ROLES_LIST, 'ISO', 'update');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.rolesList = response.data;
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


    ngAfterViewInit(): void {
        if (this.placesRef?.options) {
            this.placesRef.options.componentRestrictions = { country: 'SG' }
            this.placesRef.options.fields = ["formatted_address", "geometry", "place_id"]
        }

    }

    /**
     * @description back button
     */
    goBack() {
        this.loc.back();
    }

    validateTabChange(number: number, id: string) {
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

    /**
     * @description initialize lead details form
     */
    initleadSouceForm() {
        this.leadSouceForm = this.fb.group({
            name: ['', [Validators.required, Validators.pattern(Custom_Regex.spaces)]],
            first_name: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100),
                //  Validators.minLength(3),
                ]],
            last_name: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100), 
                // Validators.minLength(3),
            ]],
            time_zone_id: [''],
            email: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.email),]],
            entity_type_id: [''],
            phone_number: ['', [Validators.pattern(Custom_Regex.digitsOnly)]],
            role: ['ISO'],
            company_name: ['', [Validators.pattern(Custom_Regex.spaces), Validators.pattern(Custom_Regex.lettersOnly), Validators.maxLength(100),
                //  Validators.minLength(3),
                ]],
            address: ['', [Validators.pattern(Custom_Regex.spaces)]],
            other_address: ['', [Validators.pattern(Custom_Regex.spaces)]],
            zip_code: [''],
            city: ['', [
                Validators.pattern(Custom_Regex.spaces)
            ]],
            country_id: [''],
            state_id: [''],
            ein: [''],
            send_iso_agreement:[false]
        })

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
                        // formData.append('uploaded_document_type[]', 'merchant');
                        formData.append('document[]', this.formFileArray.value[i].file, this.formFileArray.value[i].fileName);
                        formData.append('name[]', this.formFileArray.value[i].doc_name);
                        formData.append('document_type[]', this.formFileArray.value[i].doc_type);
                    }
                    formData.append('source_id', this.leadSourceId);
                    this.uploading = true;
                    this.ngxLoader.startLoader('loader1');
                    const res$ = this.apiService.postReq(API_PATH.LEAD_SOURCE_UPLOAD_DOCUMENTS, formData, 'ISO', 'update');
                    const response = await lastValueFrom(res$);
                    if (response && response.status_code == "200") {
                        this.commonService.showSuccess(response.message);
                        this.uploading = false;
                        this.ngxLoader.stopLoader('loader1');

                        this.formFileArray.clear();
                        this.getLeadSourceDocument();
                        this.getDocumentTypes();
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


    /**
     * @description get lead detail form controls
     */
    get f(): { [key: string]: AbstractControl } {
        return this.leadSouceForm.controls;
    }



    /**
     * @description on next click in lead details form
     */
    async onUpdateLeadSourceSubmit() {
        this.leadSouceForm.markAllAsTouched();
        this.leadSouceForm.markAllAsTouched();
        if (this.leadSouceForm.valid) {
            //
            try {
                this.commonService.showSpinner();

                let data = {
                    ...this.leadSouceForm.value,
                    id: this.leadSourceId,
                    type: 'ISO'

                }
                const res$ = this.apiService.postReq(API_PATH.UPDATE_LEAD_SOURCE, data, 'ISO', 'update');
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

        // this.commonService.showSpinner();
        // this.leadSouceForm.markAllAsTouched();
        // if (this.leadSouceForm.valid) {
        //     this.tabActive = {
        //         id: 'OfficerInfo',
        //         number: 2
        //     }
        //     if (this.submitterTabIndex < 1) {
        //         this.submitterTabIndex = 1;
        //     }
        //     this.changeDetectorRef.detectChanges();
        // }



    }
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
        this.accordion.expand(tabID);
        this.changeDetectorRef.detectChanges();
    }

    /**
     * @description close Accordian tab by id
     * @param tabID 
     */
    closeAccordianTab(tabID: string): void {
        this.accordion.collapse(tabID);
    }

    async onOfficerInfoSubmit() {
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

    async onPartnerInfoSubmit() {
        this.filesForm.markAllAsTouched();
        if (this.filesForm.valid) {
            try {
                this.commonService.showSpinner();
                let reqData: any = {
                    source_id: this.leadSourceId,
                    type: 'ISO'
                }
                const res$ = this.apiService.postReq(API_PATH.LEAD_SOURCE_EMAIL, reqData, 'ISO', 'update');
                let response = await lastValueFrom(res$);
                if (response && response.status_code == "200") {
                    this.commonService.showSuccess(response.message);
                    this.router.navigate([`/${this.userBaseRoute}/lead-source`]);
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
        // if (this.filesForm.valid) {
        //     this.router.navigate([`/${this.userBaseRoute}/lead-source`]);
        // }


    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }
    toggle(ID: string) {
        setTimeout(() => this.accordion.toggle(ID), 0);
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
                    this.leadSouceForm.get('country_id')?.patchValue(this.countriesList[i].id);
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
                this.leadSouceForm.patchValue({ state_id: "" });
                if (value != '') {
                    setTimeout(() => {
                        let i = this.statesList.findIndex((e: any) => e.name == value);
                        if (i > -1) {
                            this.stateId = this.statesList[i].id;
                            this.leadSouceForm.patchValue({ state_id: this.stateId });

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
            doc_type: ['', [Validators.required,]],
            doc_name: ['', [
                Validators.required,
                Validators.pattern(Custom_Regex.spaces),
                Validators.pattern(Custom_Regex.username),
                Validators.pattern(Custom_Regex.name),
                Validators.maxLength(100),
                // Validators.minLength(3)
            ]],
            file: [file],
            document_date: [null],

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
    ngDoCheck():void{
        if(this.leadSourceDetails.length)
    {this.leadSouceForm.patchValue({
        state_id:this.leadSourceDetails?.state_id
    })}
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
    async getDocumentTypes() {
        try {
            const res$ = this.apiService.postReq(API_PATH.LEAD_SOURCE_DOCUMENTS, { source_id: this.leadSourceId }, 'ISO', 'update');
            const response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                this.docTypes = response.data;
                this.docTypes.forEach(object => { object.toggle = false });

                for (let i = 0; i < this.docTypes.length; i++) {
                    if (this.docTypes[i].submitted == true) {
                        this.docTypes[i].toggle = true;

                    } else {
                        this.docTypes[i].toggle = false;

                    }
                }
                // this.actualdocTypes = response.data
            }
        } catch (error) {
            this.commonService.showErrorMessage(error);
        }
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
            let reqData: any = {
                page: 1,
                records_per_page: 1000,
                source_id: this.leadSourceId
            }

            const res$ = this.apiService.postReq(API_PATH.LEAD_SOURCE_UPLODED_DOCUMENTS_LIST, reqData, 'ISO', 'update');
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


    /**
     * @description delete user after confirmation
     * @param user 
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { Promise<void> }
     */
    async documentsDelete(id: any): Promise<void> {
        let reqData: any = {
            document_id: id
        }
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_SOURCE_DOCUMENT_DELETE, reqData, 'ISO', 'update');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.uploadedDocsList = this.uploadedDocsList.filter((e) => e.document_id != id);
                this.getDocumentTypes();
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

}




