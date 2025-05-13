import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SessionRequestDetailsPage } from './session-request-details.page';

const routes: Routes = [
  {
    path: '',
    component: SessionRequestDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SessionRequestDetailsPageRoutingModule {}
