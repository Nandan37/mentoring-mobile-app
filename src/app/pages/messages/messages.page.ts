import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService, UtilService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {
  showChat: any;
  public headerConfig: any = {
    menu: true,
    headerColor: 'primary',
    notification: false,
    label:'MESSAGES'
  };
  isLoaded: boolean = false;

  constructor(
    private route: Router,
    private profileService: ProfileService,
    private utilsService: UtilService,
    private toast: ToastService
  ) {}
  ngOnInit(): void {
      
  }

  async ionViewWillEnter() {
    this.showChat = await this.profileService.getChatToken();
    this.isLoaded = true;
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

  showToast(event: any) {
    this.toast.showToast(event.message, event.type);
  }
}
