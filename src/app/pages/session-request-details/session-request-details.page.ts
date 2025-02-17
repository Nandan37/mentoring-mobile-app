import { Component, OnInit, ViewChild } from '@angular/core';
import { PLATFORMS } from 'src/app/core/constants/formConstant';
import { FormService } from 'src/app/core/services/form/form.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import { DynamicFormComponent } from 'src/app/shared/components';

@Component({
  selector: 'app-session-request-details',
  templateUrl: './session-request-details.page.html',
  styleUrls: ['./session-request-details.page.scss'],
})
export class SessionRequestDetailsPage implements OnInit {
  @ViewChild('platformForm') platformForm: DynamicFormComponent;
  showFullText: boolean;
  isAccepted: boolean = false;
  meetingPlatforms: any;
  selectedLink: any;
  selectedHint: any;
  editSessionBtn: boolean;

  constructor(private form: FormService,private sessionService: SessionService,) { }
  public headerConfig: any = {
    backButton: true,
    headerColor: 'primary'
  };

  ngOnInit() {
    this.getPlatformFormDetails()
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

  addLink(){
    if (this.platformForm.myForm.valid){
      let meetingInfo = {
        'meeting_info':{
          'platform': this.selectedLink.name,
          'link': this.platformForm.myForm.value?.link,
          'value': this.selectedLink.value,
          "meta": {
            "password": this.platformForm.myForm.value?.password,
            "meetingId":this.platformForm.myForm.value?.meetingId
        }

      }}
      this.sessionService.createSession(meetingInfo,'33');
      this.editSessionBtn = true;
    }
  }

 async getPlatformFormDetails() {
    let form = await this.form.getForm(PLATFORMS);
    this.meetingPlatforms = form.data.fields.forms;
    this.selectedLink = this.meetingPlatforms[0];
    this.selectedHint = this.meetingPlatforms[0].hint;
  }
  clickOptions(event:any){
    this.selectedHint = event.detail.value.hint;
  }
  compareWithFn(o1, o2) {
    return o1 === o2;
  };

}
