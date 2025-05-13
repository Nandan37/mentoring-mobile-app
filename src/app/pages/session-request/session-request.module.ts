import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SessionRequestPageRoutingModule } from './session-request-routing.module';

import { SessionRequestPage } from './session-request.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SessionRequestPageRoutingModule,
    SharedModule,
  ],
  declarations: [SessionRequestPage]
})
export class SessionRequestPageModule {}
