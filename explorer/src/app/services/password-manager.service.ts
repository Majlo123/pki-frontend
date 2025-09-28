import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PasswordEntry {
  id: number;
  siteName: string;
  username: string;
  encryptedPassword: string;
  description?: string;
  certificateId: number;
  certificateSubject: string;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordEntryRequest {
  siteName: string;
  username: string;
  encryptedPassword: string;
  certificateId: number;
  description?: string;
}

export interface PasswordStats {
  totalPasswordEntries: number;
  activeCertificates: number;
}

@Injectable({
  providedIn: 'root'
})
export class PasswordManagerService {
  private apiUrl = 'https://localhost:8443/api/password-manager';

  constructor(private http: HttpClient) {}

  getPasswordEntries(): Observable<PasswordEntry[]> {
    return this.http.get<PasswordEntry[]>(`${this.apiUrl}/entries`);
  }

  createPasswordEntry(request: PasswordEntryRequest): Observable<PasswordEntry> {
    return this.http.post<PasswordEntry>(`${this.apiUrl}/entries`, request);
  }

  updatePasswordEntry(id: number, request: PasswordEntryRequest): Observable<PasswordEntry> {
    return this.http.put<PasswordEntry>(`${this.apiUrl}/entries/${id}`, request);
  }

  deletePasswordEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/entries/${id}`);
  }

  searchPasswordEntries(searchTerm: string): Observable<PasswordEntry[]> {
    return this.http.get<PasswordEntry[]>(`${this.apiUrl}/entries/search`, {
      params: { q: searchTerm }
    });
  }

  getPasswordStats(): Observable<PasswordStats> {
    return this.http.get<PasswordStats>(`${this.apiUrl}/stats`);
  }
}
