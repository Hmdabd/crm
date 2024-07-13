import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataService {
  // filter user data in dashboard-cards 
  private searchDataSubject = new Subject<{ selectedUserId: number }>();
  searchData$ = this.searchDataSubject.asObservable();
  // filter team data in dashboard-cards
  private searchTeamDataSubject = new Subject<{ selectedTeamId: number }>();
  searchTeamData$ = this.searchTeamDataSubject.asObservable();
  //get Lead source data on id base 
  private leadSourceDataSubject = new Subject<{ leadSourceId: number }>();
  leadSourceData$ = this.leadSourceDataSubject.asObservable(); 

  private statesDataSubject = new Subject<{ statesId: number }>();
  statesData$ = this.statesDataSubject.asObservable(); 

  constructor() {}
  // filter user data in dashboard-cards 

  triggerSearch(selectedUserId: number) {
      this.searchDataSubject.next({ selectedUserId });
  }
    // filter team data in dashboard-cards

  selectedTeamTriggerSearch(selectedTeamId: number) {
      this.searchTeamDataSubject.next({ selectedTeamId });
  }
  leadSourceTriggerSearch(leadSourceId: number) {
      this.leadSourceDataSubject.next({ leadSourceId });
      console.log('Lead Source ID emitted:', leadSourceId);
  }

  statesTriggerSearch(statesId: number) {
    this.statesDataSubject.next({ statesId });
    console.log('state emitted:', statesId);
}
}
