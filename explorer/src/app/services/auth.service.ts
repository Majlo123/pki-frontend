import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../core/model/user.model';
import { LoginResponse } from '../core/model/jwt-session.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiBaseUrl = 'https://localhost:8443/api';
  private authTokenKey = 'pki_jwt_token';
  private userEmailKey = 'pki_user_email';
  private userRoleKey = 'pki_user_role';
  private useJwtKey = 'pki_use_jwt';

  isLoggedIn = signal<boolean>(this.hasToken());
  currentUserEmail = signal<string | null>(localStorage.getItem(this.userEmailKey));
  currentUserRole = signal<string | null>(localStorage.getItem(this.userRoleKey));
  useJwt = signal<boolean>(localStorage.getItem(this.useJwtKey) === 'true');

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string, captchaToken?: string | null): Observable<{success: boolean, role?: string}> {
    // Prvo pokušavamo JWT login
    console.log('🔐 Pokušavamo JWT login za:', email);
    const jwtLoginData = {
      email: email,
      password: password,
      ...(captchaToken && { captchaToken })
    };

    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, jwtLoginData).pipe(
      map((response) => {
        console.log('✅ JWT login uspešan:', response);
        if (response && response.token && response.user && response.user.enabled) {
          // JWT uspešan - čuvamo JWT token
          localStorage.setItem(this.authTokenKey, response.token);
          localStorage.setItem(this.userEmailKey, response.user.email);
          localStorage.setItem(this.userRoleKey, response.user.role);
          localStorage.setItem(this.useJwtKey, 'true');
          
          this.isLoggedIn.set(true);
          this.currentUserEmail.set(response.user.email);
          this.currentUserRole.set(response.user.role);
          this.useJwt.set(true);
          
          console.log('💾 JWT token sačuvan:', response.token.substring(0, 20) + '...');
          return { success: true, role: response.user.role };
        }
        return { success: false };
      }),
      catchError((error) => {
        console.log('❌ JWT login neuspešan, pokušavamo Basic Auth:', error);
        // JWT neuspešan, pokušavamo Basic Auth kao fallback
        return this.loginWithBasicAuth(email, password, captchaToken);
      })
    );
  }

  private loginWithBasicAuth(email: string, password: string, captchaToken?: string | null): Observable<{success: boolean, role?: string}> {
    console.log('🔒 Fallback na Basic Auth za:', email);
    const token = 'Basic ' + btoa(`${email}:${password}`);
    const headers = new HttpHeaders({
      Authorization: token,
      ...(captchaToken && { 'X-Captcha-Token': captchaToken })
    });

    return this.http.get<User>(`${this.apiBaseUrl}/auth/me`, { headers }).pipe(
      map((user) => {
        console.log('✅ Basic Auth uspešan:', user);
        if (user && user.enabled) {
          localStorage.setItem(this.authTokenKey, token);
          localStorage.setItem(this.userEmailKey, email);
          localStorage.setItem(this.userRoleKey, user.role);
          localStorage.setItem(this.useJwtKey, 'false');
          
          this.isLoggedIn.set(true);
          this.currentUserEmail.set(email);
          this.currentUserRole.set(user.role);
          this.useJwt.set(false);
          
          console.log('💾 Basic Auth token sačuvan');
          return { success: true, role: user.role };
        }
        return { success: false };
      }),
      catchError((error) => {
        console.log('❌ Basic Auth takođe neuspešan:', error);
        return of({ success: false });
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.authTokenKey);
    localStorage.removeItem(this.userEmailKey);
    localStorage.removeItem(this.userRoleKey);
    localStorage.removeItem(this.useJwtKey);
    this.isLoggedIn.set(false);
    this.currentUserEmail.set(null);
    this.currentUserRole.set(null);
    this.useJwt.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      return new HttpHeaders();
    }

    // Ako koristimo JWT, dodajemo Bearer prefix, inače koristimo kako je već smešteno (Basic)
    const authHeader = this.useJwt() && !token.startsWith('Basic ') 
      ? `Bearer ${token}` 
      : token;

    return new HttpHeaders({
      'Authorization': authHeader
    });
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
