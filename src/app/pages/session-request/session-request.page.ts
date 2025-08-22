import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/core/services';
import { DynamicFormComponent } from 'src/app/shared/components';
import { CommonRoutes } from 'src/global.routes';
import { SessionService } from '../../core/services/session/session.service';
import { FormService } from 'src/app/core/services/form/form.service';
import { REQUEST_SESSION_FORM } from 'src/app/core/constants/formConstant';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-session-request',
  templateUrl: './session-request.page.html',
  styleUrls: ['./session-request.page.scss'],
})
export class SessionRequestPage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;

  isSubmited: boolean = false;
  ids: any = {};
  formData: any;

  constructor(private router: Router, private toast: ToastService, private activatedRoute: ActivatedRoute,
    private sessionService: SessionService, private form: FormService
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.activatedRoute.queryParams.subscribe(({ data }) => this.ids.requestee_id = data);
    const result = await this.form.getForm(REQUEST_SESSION_FORM);
    this.formData = {
          "controls": [
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
                "name": "timezone",
                "label": "Timezone",
                "value": "",
                "class": "ion-no-margin",
                "type": "text",
                "placeHolder": "Ex. Timezone of the person you are requesting a session with",
                "position": "floating",
                "errorMessage": {
                    "required": "Enter requestee ID",
                    "pattern": "This field can only contain alphanumeric characters"
                },
                "validators": {
                    "required": false,
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
                 "maxLength": 300
                }
              }
          ]
      }
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
        const userTimezone = moment.tz.guess();
        // Parse the original IST date
        const originalIST = moment.tz(form.start_date, userTimezone);
        const originalEndDate = moment.tz(form.end_date, userTimezone);

        const currentTimeInSelectedTZ = moment.tz('Africa/Bamako');
      
        // Get as epoch milliseconds
        const currentEpochInSelectedTZ = currentTimeInSelectedTZ.valueOf();
      
      
        // Extract time components (hours, minutes, seconds)
        const hours = originalIST.hours();
        const minutes = originalIST.minutes();
        const seconds = originalIST.seconds();
        const Ehours = originalEndDate.hours();
        const Eminutes = originalEndDate.minutes();
        const Eseconds = originalEndDate.seconds();


        // Create a new date with the SAME TIME but in the selected timezone
        const eventDateInSelectedTZ = moment.tz('Africa/Bamako')
          .hours(hours)
          .minutes(minutes)
          .seconds(seconds)
          .milliseconds(0);

            const EeventDateInSelectedTZ = moment.tz('Africa/Bamako')
          .hours(Ehours)
          .minutes(Eminutes)
          .seconds(Eseconds)
          .milliseconds(0);
      
          // Get the epoch milliseconds
          const eventEpochInSelectedTZ = eventDateInSelectedTZ.valueOf();
          const EeventEpochInSelectedTZ = EeventDateInSelectedTZ.valueOf();

          console.log('Original IST time:', originalIST.format('HH:mm:ss'));
          console.log('Same time in', 'Africa/Bamako' + ':', eventDateInSelectedTZ.format('HH:mm:ss'));
          console.log('Epoch milliseconds:', eventEpochInSelectedTZ, currentEpochInSelectedTZ);
      form.start_date = eventEpochInSelectedTZ /1000;
      form.end_date = EeventEpochInSelectedTZ / 1000;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      form.time_zone = timezone;
      this.form1.myForm.markAsPristine();

      console.log(form)
      this.sessionService.requestSession(form).then((res) => {
        if (res) {
          this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.REQUESTS}`]);
          this.toast.showToast(res.message, "success");
          this.isSubmited = true;
          this.form1.reset();
        }}).catch((err) => {});

      
    }
  }

}
