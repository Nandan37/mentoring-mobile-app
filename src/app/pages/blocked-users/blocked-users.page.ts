import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/core/services';
import { ToastService } from 'src/app/core/services';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService } from 'src/app/core/services';


@Component({
  selector: 'app-blocked-users',
  templateUrl: './blocked-users.page.html',
  styleUrls: ['./blocked-users.page.scss'],
})
export class BlockedUsersPage implements OnInit {

  public headerConfig: any = {
    menu: true,
    headerColor: 'primary',
    notification: false,
    label:"BLOCKED_USERS"
  };

  blockedUsers : any =[
    {
      "id" : "34",
      "name" : "Name 1",
      "image" : "",
      "designation" : "Mentor",
      "organization" : "Organization"
    },

    {
      "id" : "35",
      "name" : "Name 2",
      "image" : "",
      "designation" : "Mentor",
      "organization" : "Organization"
    },

    {
      "id" : "36",
      "name" : "Name 3",
      "image" : "",
      "designation" : "Mentor",
      "organization" : "Organization"
    },

    {
      "id" : "37",
      "name" : "Name 4",
      "image" : "",
      "designation" : "Mentor",
      "organization" : "Organization"
    },

    {
      "id" : "38",
      "name" : "Name 5",
      "image" : "",
      "designation" : "Mentor",
      "organization" : "Organization"
    } 
  ]

  buttonConfig : any = [
    {
      "color" : "ion-color-secondary",
      "action": "",
      "label" : "UNBLOCK",
      "textColor": "red"
    }
  ]

  constructor(
              private util : UtilService,
              private toast : ToastService,
              private router : Router,
              private httpService : HttpService
              ) { }

  ngOnInit() {
    // this.getBlockedUsers();
  }

  // getBlockedUsers(){
  //   const config = {
  //                    url:,
  //                   };
  //    this.httpService.get(config).then((resp) => {
  //          this.blockedUsers= resp;
  //        });
  // }

  async onUnblock(user: any) {
    const userId = user.data;
    const result = await this.util.alertPopup({
    header: "CONFIRM_UNBLOCK_HEADER",   
    message: "CONFIRM_UNBLOCK_MESSAGE", 
    cancel: "CANCEL",
    submit: "UNBLOCK",
  },
   {name: user.name}
  );

  if (result) {
    // const payload = {
    //       url:,
    //       payload: {user_id: userId},
    //       };
    //     this.httpService.post(payload)
        this.toast.showToast("UNBLOCK_TOAST_MESSAGE", "success")
        this.router.navigate([CommonRoutes.MENTOR_DETAILS, userId]);
  } 
  
  
}

cardConfig = 
  {
          "header": {
            "image": "image",
            "title": "name"
          },
          "body": [
            {
              "name": "designation",
              "type": "string",
            },

            {
              "name": "organization",
              "type": "string",
            },
          ]
        }
    }
  



