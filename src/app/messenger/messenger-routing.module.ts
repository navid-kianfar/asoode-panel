import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MessengerComponent } from './pages/messenger/messenger.component';
import { AuthGuard } from '../auth/guards/auth.guard';

const routes: Routes = [
  {
    path: 'messenger',
    component: MessengerComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessengerRoutingModule { }
