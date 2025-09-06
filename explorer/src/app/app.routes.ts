import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import {authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ruta za stranicu za prijavu
  { path: 'login', component: LoginComponent },

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

