import { Component, OnInit, ViewChild } from '@angular/core';
import { DynamicFormComponent } from 'src/app/shared/components';

@Component({
  selector: 'app-session-request',
  templateUrl: './session-request.page.html',
  styleUrls: ['./session-request.page.scss'],
})
export class SessionRequestPage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;

  formData = {
    controls:[
    {
      "name": "title",
      "label": "Session title",
      "value": "",
      "class": "ion-no-margin",
      "type": "text",
      "placeHolder": "Ex. Name of your session",
      "position": "floating",
      "errorMessage": {
        "required": "Enter session title",
        "pattern": "This field can only contain alphanumeric characters"
      },
      "validators": {
        "required": true,
        "maxLength": 255,
        "pattern": "^[a-zA-Z0-9-.,s ]+$"
      }
    },
    {
      "name": "start_date",
      "label": "Start date",
      "class": "ion-no-margin",
      "value": "",
      "displayFormat": "DD/MMM/YYYY HH:mm",
      "dependedChild": "end_date",
      "type": "date",
      "placeHolder": "YYYY-MM-DD hh:mm",
      "errorMessage": {
        "required": "Enter start date"
      },
      "position": "floating",
      "validators": {
        "required": true
      }
    },
    {
      "name": "end_date",
      "label": "End date",
      "class": "ion-no-margin",
      "position": "floating",
      "value": "",
      "displayFormat": "DD/MMM/YYYY HH:mm",
      "dependedParent": "start_date",
      "type": "date",
      "placeHolder": "YYYY-MM-DD hh:mm",
      "errorMessage": {
        "required": "Enter end date"
      },
      "validators": {
        "required": true
      }
    },
    
      {
        "name": "agenda",
        "label": "Agenda",
        "value": "",
        "class": "ion-no-margin",
        "type": "textarea",
        "placeHolder": "Let the mentor know what the purpose of this meeting is",
        "position": "floating",
        "errorMessage": {
          "required": "Enter description",
          "pattern": "This field can only contain alphanumeric characters"
        },
        "validators": {
          "required": true,
          "maxLength": 255,
          "pattern": "^[a-zA-Z0-9-.,s ]+$"
        }
      }
    ]
}

  isSubmited: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  public headerConfig: any = {
    backButton: true,
    label: "Set agenda",
    headerColor: 'primary'
  };

  onSubmit(){
    if(!this.isSubmited){
      this.form1.onSubmit();
    }
    const form = Object.assign({}, {...this.form1.myForm.getRawValue(), ...this.form1.myForm.value});
    console.log(form)
  }

}
