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
  editSessionBtn: boolean;
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
      },
  ],
    image: '',
    agenda: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.',
    slot_request_date: '',
    request: 'PENDING'
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
    console.log('meet platform', this.meetingPlatforms)
  }

  addLater(){
    this.modal.dismiss();
    this.isModalOpen = false;
    
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

  

}
