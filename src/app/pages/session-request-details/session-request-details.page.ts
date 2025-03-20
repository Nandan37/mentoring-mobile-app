import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { PLATFORMS } from 'src/app/core/constants/formConstant';
import { ToastService, UtilService } from 'src/app/core/services';
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
  @ViewChild(IonModal) modal!: IonModal;
  showFullText: boolean;
  isAccepted: boolean = false;
  meetingPlatforms: any;
  selectedLink: any;
  selectedHint: any;
  editSessionBtn: boolean = false;
  isMeetingLinkAdded: boolean =false;
  isModalOpen: boolean = false;
  isRejected: boolean = false;

  constructor(private form: FormService,private sessionService: SessionService,private toast: ToastService,private utilService: UtilService) { }
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

  apiDemoResponse:any = {
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
      },
  ],
    image: '',
    agenda: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.',
    slot_request_date: '',
    request: 'PENDING',
    id: "11"
  }

  accept(){
    this.isAccepted = true;
    this.toast.showToast("You have accepted this session. [Mentee’s Name] has been added to your connections.", 'success');
  }

  async reject(){
    let msg = {
      header: 'Reject ?',
      message: 'Are you sure you want to reject the slot request ?',
      cancel: 'CANCEL',
      submit: 'Reject',
      inputs: [
        {
          name: 'reason',  
          type: 'textarea',
          placeholder: 'Let NAME know why you are rejecting there slot...',
        }
      ]
    };
    const response = await this.utilService.alertPopup(msg);
    if (response) {
      this.isRejected = true;
      this.toast.showToast("You have rejected the message slot request", 'danger');
      console.log('Rejection Reason:', response); // Access input value
    } else {
      console.log('User canceled the rejection');
    }
  }

  addLink(isOpen: boolean){
    this.isModalOpen = isOpen;
    if (this.platformForm?.myForm?.valid){
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

  addNow(){
    this.isMeetingLinkAdded = true;
    this.modal.dismiss();
    this.isModalOpen =false;
  }

  editLink(isOpen: boolean){
    this.isModalOpen = isOpen;

    for(let j=0;j<this?.meetingPlatforms?.length;j++){
      if( this.existingData.meeting_info.platform == this?.meetingPlatforms[j].name){
         this.selectedLink = this?.meetingPlatforms[j];
         this.selectedHint = this.meetingPlatforms[j].hint;
        let obj = this?.meetingPlatforms[j]?.form?.controls.find( (link:any) => link?.name == 'link')
        let meetingId = this?.meetingPlatforms[j]?.form?.controls.find( (meetingId:any) => meetingId?.name == 'meetingId')
        let password = this?.meetingPlatforms[j]?.form?.controls.find( (password:any) => password?.name == 'password')
        if(obj && this.existingData?.meeting_info?.link){
          obj.value = this.existingData?.meeting_info?.link;
        }
        if(this.existingData?.meeting_info?.meta?.meetingId){
          meetingId.value = this.existingData?.meeting_info?.meta?.meetingId;
          password.value = this.existingData?.meeting_info?.meta?.password;
        }
      }
    }
  }

  addLater(){
    this.modal.dismiss();
    this.isModalOpen = false;
    
  }

  viewProfile(id: any){
    console.log(id)
  }

  yourScheduledData = [
    { 
      date:"2025-01-13",
      bookedSlots: [
        { startTime:"12:01:01", 
          endTime:"13:00:01",
          title: "Session 1"
        },
        { startTime:"01:01:01", 
          endTime:"14:00:01",
          title: 'session 2'
        },
        { startTime:"12:01:01", 
          endTime:"13:00:01",
          title: "Session 1"
        },
        { startTime:"01:01:01", 
          endTime:"14:00:01",
          title: 'session 2'
        }
      ]  
    },
    { 
      date:"2025-02-13",
      bookedSlots: [
        { startTime:"12:01:01", 
          endTime:"13:00:01",
          title: "Session 1"
        },
        { startTime:"01:01:01", 
          endTime:"14:00:01",
          title: 'session 2'
        }
      ]   
    },
    { 
      date:"2025-01-13",
      bookedSlots: [
        { startTime:"12:01:01", 
          endTime:"13:00:01",
          title: "Session 1"
        },
        { startTime:"01:01:01", 
          endTime:"14:00:01",
          title: 'session 2'
        }
      ]  
    },
    { 
      date:"2025-02-13",
      bookedSlots: [
        { startTime:"12:01:01", 
          endTime:"13:00:01",
          title: "Session 1"
        },
        { startTime:"01:01:01", 
          endTime:"14:00:01",
          title: 'session 2'
        }
      ]   
    },
    { 
      date:"2025-01-13",
      bookedSlots: [
        { startTime:"12:01:01", 
          endTime:"13:00:01",
          title: "Session 1"
        },
        { startTime:"01:01:01", 
          endTime:"14:00:01",
          title: 'session 2'
        }
      ]  
    },
    { 
      date:"2025-02-13",
      bookedSlots: [
        { startTime:"12:01:01", 
          endTime:"13:00:01",
          title: "Session 1"
        },
        { startTime:"01:01:01", 
          endTime:"14:00:01",
          title: 'session 2'
        }
      ]   
    }
  ];

  existingData: any = {
    "id": 1383,
    "title": "Demo for meeting link",
    "description": "link",
    "recommended_for": [
        {
            "label": "Block education officer",
            "value": "beo",
            "type": "beo"
        },
        {
            "label": "District education officer",
            "value": "deo",
            "type": "deo"
        }
    ],
    "categories": [
        {
            "label": "Educational leadership",
            "value": "educational_leadership",
            "type": "educational_leadership"
        },
        {
            "label": "School process",
            "value": "school_process",
            "type": "school_process"
        }
    ],
    "medium": [
        {
            "label": "English",
            "value": "en_in",
            "type": "en_in"
        },
        {
            "label": "french",
            "value": "fr",
            "type": "fr"
        }
    ],
    "image": [],
    "mentor_id": "33",
    "session_reschedule": 0,
    "status": {
        "value": "PUBLISHED",
        "label": "Upcoming"
    },
    "time_zone": "Asia/Calcutta",
    "start_date": "2025-03-31T11:21:00.000Z",
    "end_date": "2025-03-31T12:21:00.000Z",
    "started_at": null,
    "completed_at": null,
    "is_feedback_skipped": false,
    "mentee_feedback_question_set": "TheCmentee",
    "mentor_feedback_question_set": "TheCmentor",
    "meeting_info": {
      "link": "https://meet.google.com/duv-zgxk-qro",
      "meta": {},
      "value": "Gmeet",
      "platform": "Google meet"
  },
    "meta": null,
    "visibility": "ASSOCIATED",
    "visible_to_organizations": [
        "17",
        "19",
        "15"
    ],
    "mentor_organization_id": "15",
    "seats_remaining": 5,
    "seats_limit": 5,
    "type": {
        "value": "PUBLIC",
        "label": "Public"
    },
    "mentor_name": "Anupama pujar all permissions",
    "created_by": "33",
    "updated_by": "33",
    "created_at": "2025-03-19T11:21:45.603Z",
    "updated_at": "2025-03-19T11:21:48.045Z",
    "deleted_at": null,
    "is_enrolled": false,
    "is_assigned": false,
    "mentees": [],
    "organization": "The Catalysts",
    "mentor_designation": [
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
        },
        {
            "value": "other",
            "label": "other"
        },
        {
            "value": "other",
            "label": "other"
        }
    ]
}

}
