import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

import { authGuard } from './guards/auth.guard';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { PasswordRecoveryComponent } from './components/password-recovery/password-recovery.component';

export const routes: Routes = [
  // Ruta za stranicu za prijavu
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'password-recovery', component: PasswordRecoveryComponent },

  // Grupa ruta za administratorski deo, zaštićena "čuvarem" (guard)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard], // Ako korisnik nije ulogovan, ne može pristupiti
    children: [
      { path: 'dashboard', component: DashboardComponent },
      // Ako korisnik ode na /admin, preusmeri ga na /admin/dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Podrazumevane rute
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } // Ako ne postoji ruta, vrati na login
];
