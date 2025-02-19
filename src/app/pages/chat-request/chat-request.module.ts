import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatRequestPageRoutingModule } from './chat-request-routing.module';

import { ChatRequestPage } from './chat-request.page';
import { CoreModule } from 'src/app/core/core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FrontendChatLibraryModule } from 'frontend-chat-library-kiran';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatRequestPageRoutingModule,
    CoreModule,
    SharedModule,
    FrontendChatLibraryModule,
  ],
  declarations: [ChatRequestPage],
})
export class ChatRequestPageModule {}
