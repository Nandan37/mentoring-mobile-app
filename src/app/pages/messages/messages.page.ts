import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {
  showChat: boolean = false;
  public headerConfig: any = {
    menu: false,
    headerColor: 'primary',
    notification: false,
  };

  constructor(
    private route: Router,
    private profileService: ProfileService,
    private utilsService: UtilService
  ) {}

  async ngOnInit() {
    await this.profileService.getChatToken();
    this.showChat = true;
  }

  onSelect(data: any) {
    this.route.navigate([CommonRoutes.CHAT, data]);
  }

  messageBadge(event: any) {
    if (event) {
      this.utilsService.addMessageBadge();
    } else {
      this.utilsService.removeMessageBadge();
    }
  }
}
