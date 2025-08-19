import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BlockedUsersPageRoutingModule } from './blocked-users-routing.module';

import { BlockedUsersPage } from './blocked-users.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BlockedUsersPageRoutingModule,
    SharedModule,
    
  ],
  declarations: [BlockedUsersPage]
})
export class BlockedUsersPageModule {}
