import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, ToastService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.page.html',
  styleUrls: ['./chat-window.page.scss'],
})
export class ChatWindowPage implements OnInit {
  showChat: boolean = false;
  public headerConfig: any = {
    menu: false,
    headerColor: 'primary',
  };
  rid: any;
  id : any;
  constructor(
    private routerParams: ActivatedRoute,
    private location: Location,
    private profileService: ProfileService,
    private router: Router,
    private apiServer : HttpService,
    private toastService: ToastService
  ) {
    routerParams.params.subscribe((parameters) => {
      this.rid = parameters?.id;
      this.ngOnInit();
    });
    routerParams.queryParams.subscribe((parameters) => {
      this.id = parameters?.id;
    })
  }

  async ngOnInit() {
    await this.profileService.getChatToken();
    this.showChat = true;
  }
  onBack() {
    this.location.back();
  }

  onClickProfile(externalId){
    this.apiServer.post({url:urlConstants.API_URLS.GETUSERIDBYRID, payload:{"external_user_id":externalId}}).then((resp) =>{
      this.router.navigate([CommonRoutes.MENTOR_DETAILS, resp?.result?.user_id]);
    })
  }

  limitExceeded(event){
    this.toastService.showToast('MESSAGE_TEXT_LIMIT','danger');
  }
}
