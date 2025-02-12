import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SessionRequestDetailsPageRoutingModule } from './session-request-details-routing.module';

import { SessionRequestDetailsPage } from './session-request-details.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SessionRequestDetailsPageRoutingModule,
    SharedModule
  ],
  declarations: [SessionRequestDetailsPage]
})
export class SessionRequestDetailsPageModule {}
