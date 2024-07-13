import { SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';

@Component({
  selector: 'app-affiliate-owner2-signature',
  templateUrl: './affiliate-owner2-signature.component.html',
  styleUrls: ['./affiliate-owner2-signature.component.scss']
})
export class AffiliateOwner2SignatureComponent implements OnInit {
  @Input() tabView: boolean = true;
  @Output() tabViewChange = new EventEmitter<boolean>();
  @ViewChild('pad2', { static: false }) signaturePad!: SignaturePadComponent;
  @Input() customer2Sign = '';
  @Input() customerSign = '';
  @Input() customer2SignCloseModal = '';
  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() customer2SignChange = new EventEmitter<string>();
  @Output() customerSignChange = new EventEmitter<string>();
  @Output() pendingDocuments = new EventEmitter<any>();
  @Output() customer2SignCloseModalChange = new EventEmitter<any>();
  color:string = ''
  signaturePadOptions: any = { // passed through to szimek/signature_pad constructor
      'minWidth': 2,
      'canvasWidth': 500,
      'canvasHeight': 200
  };

  constructor(private commonService: CommonService, private apiService: ApiService, private authService:AuthService) { }

  ngOnInit(): void {
    this.getUserDetails()
  }
  getUserDetails() {
    let ud = this.authService.getUserDetails();
    if (ud) {
        this.color = ud?.color;
    }
}

  ngAfterViewInit() {
      if (this.signaturePad) {
          this.signaturePad.fromDataURL(this.customer2Sign);
      }
  }

  drawComplete() {
      // will be notified of szimek/signature_pad's onEnd event
      this.customer2Sign = this.signaturePad.toDataURL();
      this.customer2SignChange.emit(this.customer2Sign);
      // console.log(this.signaturePad.toDataURL());
  }

  resetSignPad() {
      if (this.signaturePad)
          this.signaturePad.clear();
      this.customer2SignChange.emit('');
  }

  closeModal(value: any) {
      this.customer2SignCloseModal = value;
      this.customer2SignCloseModalChange.emit(this.customer2SignCloseModal)
      if (!this.customer2Sign && value == false) {
          this.commonService.showError('Please add owner 2 signature before submitting');
          return;
      }
      if (!this.customerSign && value == false) {
          this.commonService.showError('Please add owner 1 signature before submitting');
          return;
      }
      if (value == true) {
          this.close.emit();
      }
      if (this.customer2Sign && value == false) {
          this.close.emit();
          this.tabViewChange.emit(false);
          this.pendingDocuments.emit();
      }

  }


}
