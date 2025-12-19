import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login-component/login-component';
import { UserListComponent } from './features/users/user-list/user-list';
import { UserCreate } from './features/users/user-create/user-create';
import { UserEdit } from './features/users/user-edit/user-edit';
import { AppointmentListComponent } from './features/appointments/appointment-list/appointment-list';
import { AppointmentCreateComponent } from './features/appointments/appointment-create/appointment-create';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  { path: '', redirectTo: 'appointments', pathMatch: 'full' },

  {
    path: 'appointments',
    canActivate: [authGuard],
    children: [
      { path: '', component: AppointmentListComponent },
      { path: 'create', component: AppointmentCreateComponent },
    ]
  },

  {
    path: 'users',
    canActivate: [authGuard],
    children: [
      { path: '', component: UserListComponent },
      { path: 'create', component: UserCreate },
      { path: ':id', component: UserEdit },
    ]
  },

  { path: '**', redirectTo: 'appointments' }
];
