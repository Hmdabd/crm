import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ExclusivityService {

  dataSubjectnew: any;
  dataSubject = new BehaviorSubject<any>(1);
  dataSubject2 = new Subject<number>();
  storedData: any;
  retrievedExValue:any;
  constructor() { }
  send(data: any, fdata: any) {
    this.storedData = data;
    //const valueToStore = fdata;

    localStorage.setItem('data', JSON.stringify(data));
    this.dataSubject.next(data);
    this.getDataSubject();
  }

  getData(): Observable<any> {
    this.getDataSubject();
    return this.dataSubject.asObservable();
    
  }

  getDataSubject(): Subject<any> {
    // debugger
    const storedValue = localStorage.getItem('data')
    this.dataSubject2 = JSON.parse(storedValue!);
    if(storedValue == null){
      this.dataSubject2?.next(1);
      // console.log(this.dataSubject2.next(1));
    }
    return this.dataSubject2;
  }

}
