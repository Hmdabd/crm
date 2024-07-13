import { Component, EventEmitter, NgZone, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import {lastValueFrom, Subscription} from 'rxjs';
import * as Constants from '@constants/constants';
import { AuthService } from '@services/auth.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Custom_Regex } from '@constants/constants';
import moment from 'moment';
import Swal from 'sweetalert2';
@Component({
    selector: 'app-lead-notes',
    templateUrl: './lead-notes.component.html',
    styleUrls: ['../lead-activities/lead-activities.component.scss', '../../../styles/predictive-search.scss', './lead-notes.component.scss']
})
export class LeadNotesComponent implements OnInit {
    @Output() notesUpdates = new EventEmitter<any>();
    updatesList: Array<any> = [];
    search: string = '';
    update2page: number = 1;
    updatelimit: number = 10;
    totalUpdates: number = 0;
    selectedDate: string = '';
    hoveredDate: NgbDate | null = null;
    fromDate!: NgbDate | null;
    toDate!: NgbDate | null;
    maxDate!: NgbDateStruct;
    @ViewChild('datepicker') datepicker: any;
    addNoteForm!: FormGroup;
    leadID: string = '';
    leadNotesList: Array<any> = [];
    leadName: string = '';
    roles = Constants.Roles;
    userRole: string = '';
    userName: string = '';
    model!:NgbModalRef;
    selectedLead: any = {};
    canAddNote: boolean = false;
    dateFormat: string = '';
    timeZone: string = ''
    style!: { fill: string; };
    background!: { background: string; };
    colorSubs!:Subscription;
    notepage: number = 1;
    limit: number = 10;
    total: number = 0;
    color!: string;
    lead: any = {};
    usersList: Array<any> = [];
    userListPage: number = 1;
    usersListLimit: number = 1000;
    totalUsersCount: number = 0;
    mentionsArray: Array<any> = [];
    mentionConfig = {
       
    }
     htmlCode!: string;
     public htmlDoc!: HTMLElement | any;
     companyType: string = '';
    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private authService: AuthService,
        private fb: FormBuilder,
        private modalService: NgbModal,
        private ngZone: NgZone,
        public formatter: NgbDateParserFormatter,
        private calendar: NgbCalendar,
    ) { }

    ngOnInit(): void {
        this.canAddNote = this.authService.hasPermission('lead-note-add');
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.leadID = params['id'];
            this.getLeadNotes();
            this.getLeadDetailsList();
            this.getUsersList();
        //    this.getLeadUpdates();
        } else {
            this.commonService.showError('');
        }      
        this.getUserDetails();
        this.initNoteForm();
        
    }

    openModal(templateRef: TemplateRef<any>) {
        this.model = this.modalService.open(templateRef)
    }
    async getLeadDetailsList() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.LEAD_DETAILS + this.leadID, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.lead = response.data;
                
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            this.commonService.showErrorMessage(error);
        }
    }

    closeModal() {
        this.model.close();
    }

    /**
     * @description get user details from localstrorage
     * @author Shine Dezign Infonet Pvt. Ltd.
     * @returns {void}
     */
     getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.companyType = ud.company_type;
                this.userName = ud?.name;
                this.userRole = ud.role;
                this.dateFormat = ud.date_format;
                this.timeZone = ud.time_zone;
                this.getColorOnUpdate();
                this.style={fill:ud?.color};
                this.color=ud?.color;
                    // this.stroke={stroke:ud?.color};
                 
                     this.background={background:ud?.color};
                  
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
          this.getUserDetails();
        });
      }
      getDate(date: any) {
        let newDate = this.commonService.getExactDate(moment(date));
        return moment(newDate).tz(this.timeZone).format(`${this.dateFormat} hh:mm:ss A`)
     }

    ngAfterViewInit() {
        let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
        for (let i = 0; i < data?.length; i++) {
            if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                data[i].style.background = this.color.length ? this.color : '#FA5440';
            } else {
                data[i].style.background = 'none';

            }
        }
        let data2 = document.getElementsByClassName('ngx-pagination')[1]?.getElementsByTagName('li');
        for (let i = 0; i < data2?.length; i++) {
            if (data2[i].className == 'current' || data2[i].className == 'current ng-star-inserted' || data2[i].className == 'ng-star-inserted current') {
                data2[i].style.background = this.color.length ? this.color : '#FA5440';
            } else {
                data2[i].style.background = 'none';

            }
        }
    }
 
 
    async getLeadNotes() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.postReq(API_PATH.LEAD_NOTES, { lead_id: this.leadID,page: this.notepage,}, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.leadNotesList = response.data;
            } else {
                this.leadNotesList = [];
                this.notepage = 1;
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
    // async getLeadNotes() {
    //     try {
    //         this.commonService.showSpinner();
    //         let res$ = this.apiService.postReq(API_PATH.LEAD_UPDATES, { lead_id: this.leadID, page: this.notepage }, 'lead', 'list');
    //         let response = await lastValueFrom(res$);
    //         if (response && response.status_code == 200) {
    //             if (response.data.logs) {
    //                 this.leadNotesList = response.data.logs;
    //                 this.total = response.data.total
    //             } else {
    //                 this.leadNotesList = [];
    //                 this.total = 0;
    //                 this.notepage = 1;
    //             }

    //         }
    //         this.commonService.hideSpinner();
    //     } catch (error: any) {
    //         this.commonService.hideSpinner();
    //         if (error.error && error.error.message) {
    //             this.commonService.showError(error.error.message);
    //         } else {
    //             this.commonService.showError(error.message);
    //         }
    //     }
    // }


    /**
	 * @description formcontrols getters
	 * @author Shine Dezign Infonet Pvt. Ltd.
	 * @returns { [key: string]: AbstractControl }
	 */
	get f(): { [key: string]: AbstractControl } {
		return this.addNoteForm.controls;
	}

    /**
	 * @description initialize  add activity form
	 * @author Shine Dezign Infonet Pvt. Ltd.
	 */
	initNoteForm() {
		this.addNoteForm = this.fb.group({
			note: ['', [
                Validators.required,
                // Validators.pattern(Custom_Regex.spaces), 
                // Validators.pattern(Custom_Regex.address), 
                // Validators.pattern(Custom_Regex.address2),
                // Validators.minLength(3), 
                // Validators.maxLength(100)
            ]],
		});
	}

    getDimensionsByFilter(id: any){
        return this.usersList.filter((x: any) => x.id === id);
      }

    async addNote() {
        try {
            this.addNoteForm.markAllAsTouched();
            // console.log("jhh", this.addNoteForm.get('note')?.value.replace(/(\r\n|\n|\r)/gm, "").split("@"));
            let split = this.addNoteForm.get('note')?.value.replace(/(\r\n|\n|\r)/gm, " ");
            let split2 = split.replaceAll(' ',"@").split("@");
            let ids = split2.filter((t: any )=> t != "" 
            && this.usersList.findIndex(u => u.name == t.trim()) > -1).map((name: any) => 
            this.usersList.find(s => s.name == name.trim()).id);
            let selectedArray: any[] = [];
            let test: Array<any> = [];
            for (let i = 0; i < ids.length; i++) {
                test = this.getDimensionsByFilter(ids[i]);
                const result = test.reduce((obj, cur) => {});
                selectedArray.push(result);
            }
            if(this.addNoteForm.value.note){
                this.addNoteForm.get('note')?.patchValue(this.addNoteForm.get('note')?.value.trim());
            }    
            if(this.addNoteForm.valid) {
                this.commonService.showSpinner();
                const res$ = this.apiService.postReq(API_PATH.CREATE_LEAD_NOTE, { lead_id: this.leadID, note: this.addNoteForm.get('note')?.value , users: selectedArray },'lead', 'edit');
                const response = await lastValueFrom(res$);
                if(response && response.status_code == "200") {
                    this.getLeadNotes();
                    // let data = {
                    //     lead_id: this.leadID,
                    //     created_at: new Date().toISOString() ,
                    //     added_by: this.userName,
                    //     note: this.addNoteForm.get('note')?.value
                    // }
                    // this.leadNotesList = [ data, ...this.leadNotesList ];
                    this.notesUpdates.emit('data');
                    this.addNoteForm.reset();
                this.commonService.showSuccess(response.message);

                } else {
                    this.commonService.showError(response.message);
                }
                this.commonService.hideSpinner();
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
    onPageChange(p: number): void {
        this.notepage = p;
        this.getLeadNotes();
    }
    //
    ngDoCheck():void {
        
     this.getPaginationList();
    }
    getPaginationList() {

            let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
                for (let i = 0; i < data?.length; i++) {
                    if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted' || data[i].className == 'ng-star-inserted current') {
                        data[i].style.background = this.color;
                    } else {
                        data[i].style.background = 'none';

                }
                }
            let data2 = document.getElementsByClassName('ngx-pagination')[1]?.getElementsByTagName('li');
            for (let i = 0; i < data2?.length; i++) {
                if (data2[i].className == 'current' || data2[i].className == 'current ng-star-inserted' || data2[i].className == 'ng-star-inserted current') {
                    data2[i].style.background = this.color.length ? this.color : '#FA5440';
                } else {
                    data2[i].style.background = 'none';
    
                }
            }
        //    [0].style.background = 'pink'
        }
    async getUsersList(): Promise<any> {
        try {
            let url = `?&page_limit=${this.usersListLimit}&page=${this.userListPage}&lead_id=${this.leadID}`;    
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.NOTES_USER_LISTS + url, 'lead', 'edit');
            let response = await lastValueFrom(res$);
            if (response && response.data) {
                this.totalUsersCount = response.data.total;
                this.usersList = response.data;
                this.usersList.forEach(m=>{m.name = m.name.replace(/ /g,'')});
                for (let i = 0; i < this.usersList.length; i++) {
                    this.mentionsArray.push(this.usersList[i].name.replace(/ /g,''))  ;
                }
                this.mentionConfig = {
                    items: this.mentionsArray,
                    triggerChar: "@",
                    // mentionSelect: (e: any) => {
                    //     return '##' + e.label + '##';
                    //   }
                }
                
            } else {
                this.usersList = [];
                this.userListPage = 1;
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
    //
    // itemSelected(event: any) {
    //     setTimeout(() => {
    //       this.htmlDoc = document.getElementById('mentoned') as HTMLElement;
    //       console.log(this.htmlDoc.value)
          
    //       this.htmlDoc.value = this.htmlDoc.value.replace(
    //           '##' +  event.label + '##',
    //           ' <b style="background:#ffe9ea;border-radius:12px;padding:5px">' + '@'+ event.label + '</b>&nbsp;'
    //           );
    //           console.log( this.htmlDoc.value,'====>',this.htmlDoc);
    //       // put the cursor to the end of field again...
    //       this.selectEnd();
    //     }, 10);
    //   }

      itemSelected(event: any) {
        setTimeout(() => {
          this.htmlDoc = document.getElementById('mentoned') as HTMLElement;
        //   console.log(this.htmlDoc.innerHtml)
          
          this.htmlDoc.innerHtml = this.htmlDoc.innerHtml.replace(
              '##' +  event.label + '##',
              ' <b style="background:#ffe9ea;border-radius:12px;padding:5px">' + '@'+ event.label + '</b>&nbsp;'
              );
            //   console.log( this.htmlDoc.innerHtml,'====>',this.htmlDoc);
          // put the cursor to the end of field again...
          this.selectEnd();
        }, 10);
      }
    
      selectEnd() {
        let range, selection:any;
        range = document.createRange();
        range.selectNodeContents(this.htmlDoc);
        range.collapse(false);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
      getMentionColorList(){
       
           
            let ulElement = document.getElementsByClassName("dropdown-menu scrollable-menu mention-menu");
        if(ulElement && ulElement.length) {
            let ul = ulElement[0];
            let ulChilds = ul.children;
            if(ulChilds && ulChilds.length) {
                for (let index = 0; index < 1000; index++) {
                    
                }
                // setTimeout(() => {
                for (let i = 0; i <= ulChilds.length - 1; i++) {
                    let liElememnt = ulChilds[i];
                    if(liElememnt.classList.contains('mention-active')) {
                    
                        let child = liElememnt.children;
                        if(child && child.length) {
                            let childEl = child[0] as HTMLElement
                            childEl.style.setProperty("background-color", this.color, "important");
                        }
                    } else {
                        let child = liElememnt.children;
                        if(child && child.length) {
                            let childEl = child[0] as HTMLElement
                            childEl.style.setProperty("background-color", "transparent", "important");
                        }
                    }
                }
            // }, 0);
            }
        }
  
        
        // const mentionDrop =  document.getElementsByClassName('active mention-active');
        // if(mentionDrop && mentionDrop.length) {
        //     let el = mentionDrop[0];
        //     let child = el.children;
        //     if(child && child.length) {
        //         let childEl = child[0] as HTMLElement
        //         childEl.style.setProperty("background-color", this.color, "important");
        //     }
        // }
        // let check = document.getElementsByTagName('li')
        // for (let i = 0; i < mentionDrop?.length; i++) {
        //   if(check[i].className == 'active mention-active'){
        //    let data = mentionDrop[i].getElementsByTagName('a');

        //     for (let index = 0; index < data.length; index++) {
        //         data[index].style.backgroundColor = 'yellow'
                
        //     }  
        // }         
        //     if (mentionDrop[i].className == 'dropdown-item mention-item'){
        //    } else{
        //        // mentionDrop[i].style.background = '';
        //    }
        //    if(check[i].className == 'active mention-active'){
        //    //    mentionDrop[i].style.background = this.color
        //    //     //  mentionDrop[i].style.background = '';

        //    }
        // }
      }
      ngAfterContentChecked() {
        
        this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
            //   console.log("ngAfterViewChecked 2");
              this.getMentionColorList();
            }, 10);
          });
           
     
     
        
        }

           /**
     * @description get lead updatessss
     */
    async getLeadUpdates() {
        try {
            this.commonService.showSpinner();
            let res$ = this.apiService.postReq(API_PATH.LEAD_UPDATES, { lead_id: this.leadID, search: this.search, page: this.update2page, dateRange: this.selectedDate, type: 'updates' }, 'lead', 'list');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == 200) {
                if (response.data.logs) {
                    this.updatesList = response.data.logs;
                    this.totalUpdates = response.data.total
                } else {
                    this.updatesList = [];
                    this.totalUpdates = 0;
                    this.update2page = 1;
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
    onDateSelection(date: NgbDate) {
        if (!this.fromDate && !this.toDate) {
            this.fromDate = date;
        } else if (this.fromDate && !this.toDate && date && (date.equals(this.fromDate) || date.after(this.fromDate))) {
            this.toDate = date;
            this.datepicker.toggle();
        } else {
            this.toDate = null;
            this.fromDate = date;
        }
        let sDate = '';
        if (this.fromDate) {
            sDate = this.formatter.format(this.fromDate);
            if (this.toDate) {
                sDate = sDate + ' / ' + this.formatter.format(this.toDate);
                this.selectedDate = sDate;
                this.update2page = 1;
                this.getLeadUpdates();
            }
        }
    }

    /**
     * @description on page change
     * @returns {void}
     * @param p 
     */
    onUpdatePageChange(p: number): void {
        this.update2page = p;
        this.getLeadUpdates();
    }
    isHovered(date: NgbDate) {
        return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
    }

    isInside(date: NgbDate) {
        return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
    }

    isRange(date: NgbDate) {
        return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
    }

    validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
        const parsed = this.formatter.parse(input);
        return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
    }
    async  checkEmailTemplateExists(actionType: any){
        this.commonService.showSpinner();
        try {
            const res$ = this.apiService.postReq(API_PATH.LEAD_EMAIL_TEMPLATE_EXIST, { lead_id: this.leadID, action_type: this.companyType == 'broker'? 'Notes' : actionType }, 'lead', 'view');
            let response = await lastValueFrom(res$);
            if (response && response.status_code == "200") {
                if(actionType == 'Tagged user in Notes'){
                   this.addNote();
                } 
              
            } 
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error?.error?.data.already_exist == 0) {
                Swal.fire({
                    title: error?.error?.message,
                    icon: 'warning',
                    // showCancelButton: true,
                    confirmButtonText: 'OK',
                    confirmButtonColor: this.color,
                }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        Swal.close()
                    }
                })
            } else {
                if (error.error && error.error.message) {
                    this.commonService.showError(error.error.message);
                } else {
                    this.commonService.showError(error.message);

                }
            }
        }
    }
}
