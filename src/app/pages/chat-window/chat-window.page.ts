import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private router: Router
  ) {
    routerParams.params.subscribe((parameters) => {
      console.log(parameters,"sdfsdfds");
      this.rid = parameters?.id;
      this.ngOnInit();
    });
    routerParams.queryParams.subscribe((parameters) => {
      console.log(parameters,"queryParams");
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

  onClickProfile(){
    console.log(this.id,"this.id");
   this.router.navigate([
         CommonRoutes.MENTOR_DETAILS,
         this.id,
       ]);
  }
}
