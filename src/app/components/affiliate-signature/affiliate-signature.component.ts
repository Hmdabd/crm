import { SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';

@Component({
  selector: 'app-affiliate-signature',
  templateUrl: './affiliate-signature.component.html',
  styleUrls: ['./affiliate-signature.component.scss']
})
export class AffiliateSignatureComponent implements OnInit {

  @Input() tabView: boolean = true;
    @Output() tabViewChange = new EventEmitter<boolean>();
    @ViewChild('pad', { static: false }) signaturePad!: SignaturePadComponent;
    @Input() customerSign = '';
    @Input() customer1SignCloseModal = ''; 
    @Output() customer1SignCloseModalChange = new EventEmitter<any>();
    @Output() close: EventEmitter<any> = new EventEmitter();
    @Output() customerSignChange = new EventEmitter<string>();
    @Output() pendingDocuments = new EventEmitter<any>();
    @Input() leadId: string = '';
    @Input() signatureToaffilate :string = '';
    signaturePadOptions: any = { // passed through to szimek/signature_pad constructor
        'minWidth': 2,
        'canvasWidth': 500,
        'canvasHeight': 200
    };
    color: string = '#FA5440';
    constructor(private commonService: CommonService, private apiService: ApiService,
        private authService: AuthService,
        private router: Router) { }

    ngOnInit(): void {
        this.getUserDetails();
    }
    getUserDetails() {
        let ud = this.authService.getUserDetails();
        if (ud) {
            this.color = ud?.color;
        }
    }
    ngAfterViewInit() {
        if (this.signaturePad) {
            this.signaturePad.fromDataURL(this.customerSign);
        }
    }

    drawComplete() {
        // will be notified of szimek/signature_pad's onEnd event
        this.customerSign = this.signaturePad.toDataURL();
        this.customerSignChange.emit(this.customerSign);
    }

    resetSignPad() {
        if (this.signaturePad)
            this.signaturePad.clear();
        this.customerSignChange.emit('');
    }

    closeModal(value: any) {
        this.customer1SignCloseModal = value;
        // this.owner1.onOfficerInfoSubmit();
        this.customer1SignCloseModalChange.emit(this.customer1SignCloseModal);
        if (!this.customerSign && value == false) {
            this.commonService.showError('Please add owner signature before submitting');
            return;
        }
        if (value == true) {
            this.close.emit();
        }
        if (this.customerSign && value == false) {
            this.close.emit();
            this.tabViewChange.emit(false);
            this.pendingDocuments.emit();
        }

    }
}
