import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


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
    label:'Blocked Users'
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
      "color" : "red",
      "action": "",
      "label" : "Unblock",
      "bgColor": " white",
      "textColor": "#c03b3b"
    }
  ]

  constructor(private http : HttpClient ) { }

  ngOnInit() {
    this.getBlockedUsers();
  }

  getBlockedUsers(){

    this.http.get<any[]>("").subscribe({
      next: (res) => {
        console.log("Blocked users fetched:", res);
        this.blockedUsers = res;
      }
    });
  }

   onUnblock(eventData: any) {
   console.log("data received", eventData);

  
  const userId = eventData.data;
  console.log(userId, "77 data")

  this.http.post("", {userId}).subscribe();
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
  



