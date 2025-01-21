import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from 'src/app/core/services/profile/profile.service';

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
  constructor(
    private routerParams: ActivatedRoute,
    private location: Location,
    private profileService: ProfileService
  ) {
    routerParams.params.subscribe((parameters) => {
      this.rid = parameters?.id;
    });
  }

  async ngOnInit() {
    await this.profileService.getChatToken();
    this.showChat = true;
  }
  onBack() {
    this.location.back();
  }
}
