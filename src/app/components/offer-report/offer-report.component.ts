import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { API_PATH } from '@constants/api-end-points';
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { ExcelService } from '@services/excel.service';
import moment from 'moment';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-offer-report',
  templateUrl: './offer-report.component.html',
  styleUrls: ['./offer-report.component.scss', '../../styles/dashboard.scss'],
})
export class OfferReportComponent implements OnInit {
  pageLimit: number = 10;
  offerReportList: Array<any> = [];
  totalRecords: number = 0;
  page: number = 1;
  userListPage: number = 1;
  hoveredDate: NgbDate | null = null;
  fromDate!: NgbDate | null;
  toDate!: NgbDate | null;
  selectedDate: any = '';
  maxDate!: NgbDateStruct;
  userList: Array<any> = [];
  hasMoreUsers: boolean = false;
  totalOfferAmount: any = '';
  dateFormat: string = '';
  timeZone: string = '';
  statusOptions = [
    { id: 0, name: 'Non-Funded' },
    { id: 2, name: 'Both' },
    { id: 1, name: 'Funded' },
  ];
  saleOptions = [
    { id: 2, name: 'All(Sale + ISO)' },
    { id: 1, name: 'Sale' },
    { id: 0, name: 'ISO' },
  ];
  @ViewChild('datepicker') datepicker: any;
  @ViewChild('selectAll') selectAll!: ElementRef;

  tempFilter: { [key: string]: any } = {
    Date: { value: '' },
    'Lead id': { value: '' },
    'Company name': { value: '' },
    Manager: { value: null },
    Sale: { value: this.saleOptions[0] },
    User: { value: null },
    Status: { value: this.statusOptions[0] },
  };

  appliedFilter: { [key: string]: any } = {};
  colorSubs!:Subscription;
  background!: { background: string; };
  style!: { fill: string; };
  color!: string;
  search = {
    order: 'DESC',
    sortby: 'created_at'
}

  constructor(
    private commonService: CommonService,
    private apiService: ApiService,
    public formatter: NgbDateParserFormatter,
    private calendar: NgbCalendar,
    private authService: AuthService,
    private excelService: ExcelService
  ) {}

  ngOnInit(): void {
    this.getofferReports();
    this.maxDate = this.calendar.getToday();
    this.getUserListOptions();
    this.getUserDetails();
    
  }
  ngDoCheck():void {
        
    this.getPaginationList();
  this.getDateColor();

}
// custom datepicker color
getDateColor(){
  let monthNameClr = document.getElementsByClassName('ngb-dp-month-name');
  // let data3 = document.getElementsByClassName('btn btn-link ngb-dp-arrow-btn');
  let arrowColor = document.getElementsByClassName('ngb-dp-navigation-chevron');
  for (let i = 0; i < monthNameClr.length; i++) {
      monthNameClr[i].setAttribute('style',`color:${this.color}`)
      arrowColor[i].setAttribute('style',`border-color:${this.color}`)
      }
      let weekNameClr = document.getElementsByClassName('ngb-dp-weekday small');
      for (let i = 0; i < weekNameClr.length; i++) {
          weekNameClr[i].setAttribute('style',`color:${this.color}`)
          }
      


  const tds = document.getElementsByClassName('custom-day') as HTMLCollectionOf<HTMLElement>;
for (let index = 0; index < tds.length; index++) {
tds[index].style.setProperty('--custom',`${this.color}`);

}
}
  getPaginationList() {
  
        let data = document.getElementsByClassName('ngx-pagination')[0]?.getElementsByTagName('li');
            for (let i = 0; i < data?.length; i++) {
                if (data[i].className == 'current' || data[i].className == 'current ng-star-inserted'|| data[i].className == 'ng-star-inserted current') {
                    data[i].style.background = this.color;
                } else {
                    data[i].style.background = 'none';

            }
        }
  



}
  removeFilter(key: string) {
    if (key === 'Date') {
      this.selectedDate = '';
      this.toDate = null;
      this.fromDate = null;
    }
    this.tempFilter[key].value = null;
    this.onSearch();
  }
  getUserDetails(): void {
    try {
      let ud = this.authService.getUserDetails();
      if (ud) {
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

  /**
   * @description on Search click
   */
  onSearch() {
    this.page = 1;
    this.appliedFilter = JSON.parse(JSON.stringify(this.tempFilter));
    this.getofferReports();
  }

  /**
   * @description on Status Change
   */
  onStatusChange() {
    this.onSearch();
  }

  /**
   * @description reset filter
   */
  resetFilter() {
    this.selectedDate = '';
    this.fromDate = null;
    this.toDate = null;
    for (const p in this.tempFilter) {
      this.tempFilter[p].value = null;
    }
    this.onSearch();
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed))
      ? NgbDate.from(parsed)
      : currentValue;
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (
      this.fromDate &&
      !this.toDate &&
      date &&
      (date.equals(this.fromDate) || date.after(this.fromDate))
    ) {
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
        this.tempFilter['Date'].value = this.selectedDate;
        //   this.onSearch();
      }
    }
  }
  async getUserListOptions() {
    try {
      let url = `?page_limit=30&page=${this.userListPage}`;
      this.commonService.showSpinner();
      const res$ = this.apiService.getReq(
        API_PATH.LIST_FOR_USERS + url,
        'user',
        'list'
      );
      let response = await lastValueFrom(res$);
      if (response && response.data) {
        this.hasMoreUsers = response.data.hasMorePages;
        this.userList = [...this.userList, ...response.data];
      } else {
        this.userList = [];
        this.hasMoreUsers = false;
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

  /**
   * @description get leads listing
   */
  async getofferReports() {
    // add in param for sorting
    // sort_by=${this.search.sortby}&dir=${this.search.order}&
    let url = `?page_limit=${this.pageLimit}&page=${this.page}`;
    if (this.appliedFilter['Date']?.value) {
      url = `${url}&daterange_filter=${this.appliedFilter['Date']?.value}`;
    }
    if (this.appliedFilter['Lead id']?.value) {
      url = `${url}&lead_id=${this.appliedFilter['Lead id']?.value}`;
    }
    if (this.appliedFilter['Company name']?.value) {
      url = `${url}&company_name=${this.appliedFilter['Company name']?.value}`;
    }
    if (
      this.appliedFilter['User']?.value &&
      this.appliedFilter['User'].value.id
    ) {
      url = `${url}&user_id=${this.appliedFilter['User'].value.id}`;
    }
    if (
      this.appliedFilter['Manager']?.value &&
      this.appliedFilter['Manager'].value.id
    ) {
      url = `${url}&campaign=${this.appliedFilter['Manager'].value.id}`;
    }
    if (
      this.appliedFilter['Sale']?.value &&
      this.appliedFilter['Sale'].value.name
    ) {
      url = `${url}&sale=${this.appliedFilter['Sale']?.value.name}`;
    }
    if (
      this.appliedFilter['Status']?.value &&
      this.appliedFilter['Status'].value.name
    ) {
      url = `${url}&status=${this.appliedFilter['Status']?.value.name}`;
    }
    try {
      this.commonService.showSpinner();
      const res$ = this.apiService.getReq(
        API_PATH.OFFER_REPORT + url,
        'offers',
        'report'
      );
      let response = await lastValueFrom(res$);
      if (response && response.status_code == '200') {
        if (response.data && response.data.data) {
          this.offerReportList = response.data.data;
          this.totalRecords = response.data.total_records;
        } else {
          this.offerReportList = [];
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
  getTotalvalue(name: any) {
    let total = 0;
    this.offerReportList.map((result) => {
      total += Number(result[name]);
    });
    this.totalOfferAmount = '$' + total;
    return '$' + Number(total.toFixed(2)).toLocaleString('en-GB');
    //
    // if(total != 0){
    //     return total;
    // }else{
    //     return ''
    // }
  }
  async exportReportasExcel() {
    try {
      const res = await this.getReportDataForExport();
      if (res.length) {
        this.excelService.exportAsExcelFile(res, 'Offer_Report');
      } else {
        this.commonService.showError('No data found');
      }
    } catch (error: any) {
      this.commonService.showError(error.message);
    }
  }

  async getReportDataForExport() {
    try {
      let url = `?export=${'export'}`;
      this.commonService.showSpinner();
      const res$ = this.apiService.getReq(
        API_PATH.OFFER_REPORT + url,
        'offers',
        'report'
      );
      const response = await lastValueFrom(res$);
      this.commonService.hideSpinner();
      if (response && response.status_code == '200') {
        // let modifiedRes = [];
        // for (let i = 0; i < response.data.length; i++) {
        //     modifiedRes.push({
        //         ...response.data[i],
        //         'Modified date': this.getDate(response.data[i]['Modified date'])
        //     })
        // }      
        let leads = [];
        let offer_amount = 0;

        for (let i = 0; i < response.data.length; i++) {
          offer_amount += response.data[i]['Offer amount'];

          // leads.push({ '#': i + 1, ...response.data[i] });
          leads.push({ '#': i + 1, ...response.data[i], 'Modified date': this.getDate(response.data[i]['Modified date']) });
        }
        let lastRow = {
          '#': 'Total',
          'Offer amount': this.totalOfferAmount,
        };
        leads.push(lastRow);
        return Promise.resolve(leads);
      } else {
        return Promise.resolve([]);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * @description on limit change
   * @param value
   * @returns {void}
   * @author Shine Dezign Infonet Pvt. Ltd.
   */
  onLimitChange(value: number): void {
    this.pageLimit = value;
    this.page = 1;
    this.getofferReports();
  }

  /**
   * @description on page change
   * @returns {void}
   * @param p
   */
  onPageChange(p: number): void {
    this.page = p;
    this.getofferReports();
  }
  get userBaseRoute() {
    return this.authService.getUserRole().toLowerCase();
  }
  sortBy(col:string){
    if(!this.offerReportList.length){
       return;
    }
    if(this.search.sortby === col){
       if(this.search.order === 'ASC'){
          this.search.order = 'DESC'
       }else{
           this.search.order = 'ASC'
       }
    }else{
        this.search.order = 'DESC';
        this.search.sortby = col;
    }
    this.getofferReports();
    }
}
