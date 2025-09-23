import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../core/model/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiBaseUrl = 'https://localhost:8443/api';
  private authTokenKey = 'pki_admin_token';
  private userEmailKey = 'pki_admin_email';

  isLoggedIn = signal<boolean>(this.hasToken());
  currentUserEmail = signal<string | null>(localStorage.getItem(this.userEmailKey));

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string): Observable<boolean> {
    const token = 'Basic ' + btoa(`${email}:${password}`);
    const headers = new HttpHeaders({ Authorization: token });

    // Pozivamo /auth/me da proverimo da li je korisnik valjan
    return this.http.get<User>(`${this.apiBaseUrl}/auth/me`, { headers }).pipe(
      map((user) => {
        // Proveravamo da li je korisnik valjan i aktiviran (dozvoljavamo sve uloge)
        if (user && user.enabled) {
            localStorage.setItem(this.authTokenKey, token);
            localStorage.setItem(this.userEmailKey, email);
            this.isLoggedIn.set(true);
            this.currentUserEmail.set(email);
            return true;
        }
        // Ako korisnik nije aktiviran, prijava je neuspešna
        return false;
      }),
      catchError(() => {
        // Ako dobijemo 401 ili bilo koju drugu grešku, prijava je neuspešna
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.authTokenKey);
    localStorage.removeItem(this.userEmailKey);
    this.isLoggedIn.set(false);
    this.currentUserEmail.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/auth/register`, data);
  }

  recoverPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/auth/recover-password`, { email });
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.authTokenKey);
  }
}
