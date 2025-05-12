import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { DynamicFormComponent } from 'src/app/shared/components';
import { CommonRoutes } from 'src/global.routes';
import { SessionService } from '../../core/services/session/session.service';

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
      "label": "Title",
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
        "maxLength": 300,
        "pattern": "^[a-zA-Z0-9-.,s ]+$"
      }
    }
    ]
}

  isSubmited: boolean = false;
  ids: any = {};

  constructor(private router: Router, private toast: ToastService, private activatedRoute: ActivatedRoute,
    private sessionService: SessionService
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.activatedRoute.queryParams.subscribe(({ data }) => this.ids.requestee_id = data);
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
    if(this.form1.myForm.valid){
      const form = Object.assign({}, {...this.form1.myForm.getRawValue(), ...this.form1.myForm.value}, { ...this.ids});
      form.start_date = (Math.floor((new Date(form.start_date).getTime() / 1000) / 60) * 60).toString();
      form.end_date = (Math.floor((new Date(form.end_date).getTime() / 1000) / 60) * 60).toString();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      form.time_zone = timezone;
      this.form1.myForm.markAsPristine();
      this.sessionService.requestSession(form).then((res) => {
        if (res) {
          this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.REQUESTS}`]);
          this.toast.showToast(res.message, "success");
          this.isSubmited = true;
        }}).catch((err) => {});
    }
  }

}
