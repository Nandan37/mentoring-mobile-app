import { Component, OnInit } from '@angular/core';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { MENTOR_REQ_CARD_FORM } from 'src/app/core/constants/formConstant';
import * as _ from 'lodash';
//service
import { SessionService } from 'src/app/core/services/session/session.service';
import { FormService } from 'src/app/core/services/form/form.service';
import { HttpService } from 'src/app/core/services';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.page.html',
  styleUrls: ['./requests.page.scss'],
})
export class RequestsPage implements OnInit {
  public headerConfig: any = {
    menu: true,
    label: 'REQUESTS',
    headerColor: 'primary',
    notification: false,
  };
  segmentType = 'slot-requests';
  buttonConfig: any;
  data: any;
  noResult: any;
  routeData: any;
  slotBtnConfig: any;
  slotRequests: any[] = [];
  mentorForm:any;
  expiryTag = {
    label: 'EXPIRED',
    cssClass: 'expired-tag'
  };
  page = 1;
  isInfiniteScrollDisabled = false;

  constructor(
    private httpService: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private form: FormService,
  ) {}

  async ionViewWillEnter(){
    const result = await this.form.getForm(MENTOR_REQ_CARD_FORM);
    this.mentorForm = _.get(result, 'data.fields.controls');
    this.route.data.subscribe((data) => {
      this.routeData = data;
      this.buttonConfig = this.routeData?.button_config;
      this.slotBtnConfig = this.routeData.slotButtonConfig;
    });
    
    this.page = 1;
    this.slotRequests = [];
    this.data = [];
    this.isInfiniteScrollDisabled = false;
    
    if (this.segmentType === 'slot-requests') {
      await this.slotRequestData();
    } else {
      await this.pendingRequest();
    }
  }
  ngOnInit() {
  }

  async segmentChanged(event: any) {
    this.segmentType = event.target.value;
    this.page = 1;
    this.isInfiniteScrollDisabled = false;
    
    if (this.segmentType === 'slot-requests') {
      await this.slotRequestData();
    } else {
      await this.pendingRequest();
    }
  }

  async pendingRequest() {
    const config = {
      url: urlConstants.API_URLS.CONNECTION_REQUEST,
    };
    try {
      let data: any = await this.httpService.get(config);
      this.data = data ? data.result.data : [];
      if (!this.data?.length) {
        this.noResult = { subHeader: this.routeData?.noDataFound.noMessage };
      }
      return data;
    } catch (error) {
      return error;
    }
  }

  async slotRequestData() {
    try {
      const res = await this.sessionService.requestSessionList(this.page);
      const data = res?.result?.data ?? [];
      if (data.length === 0) {
        this.isInfiniteScrollDisabled = true;
        if (this.page === 1) {
          this.noResult = { subHeader: this.routeData?.noDataFound?.noSession };
        }
        return;
      }

      const formattedData = data.map(value => ({
        ...value,
        meta: this.getMeta(value),
        showTag: this.isSessionExpired(value) ? this.expiryTag : '',
        disableButton: this.isSessionExpired(value)
      }));

      this.slotRequests = [...this.slotRequests, ...formattedData];

    } catch (error) {
      console.error('Error fetching session list:', error);
      this.isInfiniteScrollDisabled = true;
    }
  }

  getMeta(value: any) {
    return {
      isSent: value?.requestee_id === value?.user_details?.user_id,
      message: value?.meta?.message,
      timeStamp: '',
      resp: value
    };
  }

  isSessionExpired(meta): boolean {
    const endDate = meta?.end_date;
    if (!endDate) return false; 
    return Date.now() > endDate * 1000;
  }
  
  onCardClick(event, data?) {
    switch (event.type) {
      case 'viewMessage':
        this.router.navigate([CommonRoutes.CHAT_REQ, event.data]);
        break;
      case 'viewDetails':
        this.router.navigate([CommonRoutes.SESSION_REQUEST_DETAILS], {queryParams: {id: data}});
        break;
    }
  }

  async loadMore($event: any) {
    if (this.segmentType === 'slot-requests') {
      this.page = this.page + 1;
      await this.slotRequestData();
    }
    $event.target.complete();
  }
}