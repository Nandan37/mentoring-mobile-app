import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-session-request-details',
  templateUrl: './session-request-details.page.html',
  styleUrls: ['./session-request-details.page.scss'],
})
export class SessionRequestDetailsPage implements OnInit {
  showFullText: boolean;
  isAccepted: boolean = false;

  constructor() { }
  public headerConfig: any = {
    backButton: true,
    headerColor: 'primary'
  };

  ngOnInit() {
  }
  fullContent: string = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.";

  toggleText() {
    this.showFullText = !this.showFullText;
  }

  apiDemoResponse = {
    name: "John don",
    designation: [
      {
          "value": "beo",
          "label": "Block education officer"
      },
      {
          "value": "co",
          "label": "Cluster officials"
      },
      {
          "value": "deo",
          "label": "District education officer"
      },
      {
          "value": "te",
          "label": "Teacher"
      }
  ],
    image: '',
    agenda: '',
    slot_request_date: '',
    request: 'PENDING'
  }

  accept(){
    console.log('accept :')
    this.isAccepted = true;
  }

}
