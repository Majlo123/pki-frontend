import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { JwtSession } from '../core/model/jwt-session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiBaseUrl = 'https://localhost:8443/api';

  constructor(private http: HttpClient) { }

  getActiveSessions(): Observable<JwtSession[]> {
    console.log('🔍 Učitavamo aktivne sesije...');
    return this.http.get<JwtSession[]>(`${this.apiBaseUrl}/sessions/active`).pipe(
      tap(sessions => console.log('📋 Aktivne sesije:', sessions)),
      catchError(error => {
        console.error('❌ Greška pri učitavanju sesija:', error);
        throw error;
      })
    );
  }

  revokeSession(sessionId: number): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/sessions/revoke/${sessionId}`, {});
  }

  revokeCurrentSession(): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/sessions/revoke`, {});
  }

  revokeAllSessions(): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/sessions/revoke-all`, {});
  }
}