import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SessionRequestPage } from './session-request.page';

const routes: Routes = [
  {
    path: '',
    component: SessionRequestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SessionRequestPageRoutingModule {}
