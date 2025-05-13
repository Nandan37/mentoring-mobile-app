import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SessionRequestDetailsPageRoutingModule } from './session-request-details-routing.module';

import { SessionRequestDetailsPage } from './session-request-details.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SessionRequestDetailsPageRoutingModule,
    SharedModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [SessionRequestDetailsPage]
})
export class SessionRequestDetailsPageModule {}
