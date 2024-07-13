import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { API_PATH } from '@constants/api-end-points';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AngularEditorComponent, AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-hub-signature-pad',
  templateUrl: './hub-signature-pad.component.html',
  styleUrls: ['./hub-signature-pad.component.scss']
})
export class HubSignaturePadComponent implements OnInit {
    @ViewChild('pad', { static: false }) signaturePad!: SignaturePadComponent;
    @ViewChild('myckeditor',{ static: false }) myckeditor:AngularEditorComponent | undefined;
    @ViewChild('canvas',{ static: false }) canvas:ElementRef | undefined;
    @Input() customerSign:any;
    @Output() close: EventEmitter<any> = new EventEmitter();
    @Output() customerSignChange = new EventEmitter<string>();
    isDraw:boolean = false;
    signaturePadOptions: any = {
        'minWidth': 2,
        'canvasWidth': 500,
        'canvasHeight': 200
    };
    color: string = '#FA5440';
    textSign:string=''
    constructor(private commonService: CommonService, private apiService: ApiService,
        private authService: AuthService) { }
        confige: AngularEditorConfig = {
            editable: true,
            spellcheck: false,
            minHeight: '10rem',
            maxHeight: '15rem',
            placeholder: 'Enter sign here...',
            translate: 'no',
            sanitize: false,
            toolbarPosition: 'top',
            defaultFontName: 'Calibri',
            defaultFontSize:'10',
            toolbarHiddenButtons: [
                [
                  'undo',
                  'redo',
                  'bold',
                  'italic',
                  'underline',
                  'strikeThrough',
                  'subscript',
                  'superscript',
                  'justifyLeft',
                  'justifyCenter',
                  'justifyRight',
                  'justifyFull',
                  'indent',
                  'outdent',
                  'insertUnorderedList',
                  'insertOrderedList',
                  'heading',
                  
                ],
                // 'fontName'
                [
                  
                  'textColor',
                  'backgroundColor',
                  'customClasses',
                  'link',
                  'unlink',
                  'insertImage',
                  'insertVideo',
                  'insertHorizontalRule',
                  'removeFormat',
                  'toggleEditorMode'
                ]
              ],
            customClasses: [
              {
                name: 'quote',
                class: 'quote',
              },
              {
                name: 'redText',
                class: 'redText'
              },
              {
                name: 'titleText',
                class: 'titleText',
                tag: 'h1',
              },
            ]
          };
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
            if(this.customerSign){
                this.signaturePad?.fromDataURL(this.customerSign);
            }
        }
    }

    drawComplete() {
        // will be notified of szimek/signature_pad's onEnd event
        if(this.isDraw){

            this.customerSign = this.signaturePad.toDataURL();
            this.customerSignChange.emit(this.customerSign);
        }
        // console.log(this.signaturePad.toDataURL());
    }

    resetSignPad() {
        if (this.signaturePad)
            this.signaturePad.clear();
        this.customerSignChange.emit('');
    }

    closeModal() {
       if(!this.isDraw){

           if(this.canvas){
                const canvas = this.canvas.nativeElement;
                 const ctx = canvas.getContext("2d");
                ctx.font = `48px ${this.myckeditor?.editorToolbar?.fontName}`;
               ctx.fillStyle = "black";
               let parseValue = this.textSign.replace(/<[^>]+>/g, '');
              ctx.fillText(parseValue,100, 100);
           
                if (!parseValue) {
                    this.commonService.showError('Please add signature before submitting');
                    return;
                }
              
       
               // This fills the background
             
               // ctx.fillRect(0, 0, 500, 200);
       
               // // Add text with spesific font
               // // ctx.font = 'bold 48px serif';
               // ctx.font = `48px ${this.myckeditor?.editorToolbar?.fontName}`;
               // // ctx.fillStyle="black"
               // // ctx.strokeStyle = "black"
               // ctx.fillStyle = "black";
               // ctx.strokeText('Maade on Fly!', 100, 100);
       
               // Make canvas to data URI
               const dataUrl = canvas.toDataURL("image/png");
               // console.log('dataUrl',dataUrl);
               this.customerSign = dataUrl;
              this.customerSignChange.emit(this.customerSign);

               
           }
       }
        
      // && value == false
        if (!this.customerSign) {
            this.commonService.showError('Please add signature before submitting');
            return;
        }
        this.close.emit();
        // if (value == true) {
        //     this.close.emit();
        // }
        // if (this.customerSign && value == false) {
        //     this.close.emit();
        //     // this.tabViewChange.emit(false);
        //     // this.pendingDocuments.emit();
        //     // this.addSignatureEmail();
        // }

    }

    // <script>
    //      window.onload = function() {
    //         const canvas = document.getElementById("canvas");
    //         const ctx = canvas.getContext("2d");
    
    //         // This fills the background
    //         ctx.fillStyle = "green";
    //         ctx.fillRect(0, 0, 500, 500);
    
    //         // Add text with spesific font
    //         ctx.font = 'bold 48px serif';
    //         ctx.strokeText('Made on Fly!', 50, 100);
    
    //         // Make canvas to data URI
    //         const dataUrl = canvas.toDataURL("image/png");
    //         // Here you can convert dataUrl to base64 and use it for other purposes
    
    //         const aDoc = document.createElement("a");
    //         aDoc.href = dataUrl;
    //         aDoc.download = "Made_on_fly.png";
    //         document.body.appendChild(aDoc);
    //         // Make a element click for download
    //         aDoc.click();
    //      }
    // </script>
}


