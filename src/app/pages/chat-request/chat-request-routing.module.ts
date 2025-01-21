import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatRequestPage } from './chat-request.page';

const routes: Routes = [
  {
    path: '',
    component: ChatRequestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatRequestPageRoutingModule {}
