import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/core/services';
import { DynamicFormComponent } from 'src/app/shared/components';
import { CommonRoutes } from 'src/global.routes';
import { SessionService } from '../../core/services/session/session.service';
import { FormService } from 'src/app/core/services/form/form.service';
import { REQUEST_SESSION_FORM } from 'src/app/core/constants/formConstant';
import * as _ from 'lodash';

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
    this.formData = _.get(result, 'data.fields');
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
