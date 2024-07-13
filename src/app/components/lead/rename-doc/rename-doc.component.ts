import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { API_PATH } from '@constants/api-end-points';
import { Custom_Regex } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-rename-doc',
    templateUrl: './rename-doc.component.html',
    styleUrls: ['./rename-doc.component.scss']
})
export class RenameDocComponent implements OnInit {
    renameForm!: FormGroup;
    @Input() filename: string = '';
    @Input() leadID: string = '';
    @Input() docID: string = '';
    @Input() tabView: string = '';
    @Input() documentType: string = '';
    @Output() closeModal: EventEmitter<any> = new EventEmitter();
    @Output()  documentList: EventEmitter<any> = new EventEmitter();
    color: string = '';

    constructor(
        private fb: FormBuilder,
        private commonService: CommonService,
        private apiService: ApiService,
        private authService:AuthService
    ) { }

    ngOnInit(): void {
        this.initRenameForm();
        this.getUserDetail();
    }

    /**
     * @description initialize chnage password form
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
     initRenameForm() {
        this.renameForm = this.fb.group({
            name: [this.filename, [
                Validators.required, 
                Validators.pattern(Custom_Regex.spaces), 
                Validators.pattern(Custom_Regex.address), 
                Validators.pattern(Custom_Regex.address2),
                // Validators.minLength(3), 
                Validators.maxLength(100)]],
        })
    }
    getUserDetail(){
        let ud = this.authService.getUserDetails();
        if(ud){
            this.color = ud?.color;

        }
    }

    /**
     * @description change passsword submit
     * @returns {Promise<void>}
     * @author Shine Dezign Infonet Pvt. Ltd.
     */
    async renameSubmit(): Promise<void> {
        this.renameForm.markAllAsTouched();
        if (this.renameForm.valid) {
            try {
                let api_PATH = API_PATH.RENAME_LEAD_DOC;
                if(this.tabView == 'Company'){
                    api_PATH = API_PATH.COMPANY_DOCUMENTS_RENAME;
                }else{
                    api_PATH = API_PATH.RENAME_LEAD_DOC;
                }
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(api_PATH, { document_id: this.docID, document_type: this.documentType,name: this.renameForm.value.name }, 'lead', 'edit');
                let response = await lastValueFrom(res$);
                if (response) {
                    this.commonService.showSuccess(response.message);
                    this.closeModal.emit({
                        name: this.renameForm.value.name
                    });
                    this.documentList.emit()
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

    /**
     * @description formcontrols getters
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns { [key: string]: AbstractControl }
     */
    get f(): { [key: string]: AbstractControl } {
        return this.renameForm.controls;
    }

}
