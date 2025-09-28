import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certificate } from '../core/model/certificate.model';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private adminApiUrl = 'https://localhost:8443/api/admin';
  private userApiUrl = 'https://localhost:8443/api/user/certificates';
  private csrApiUrl = 'https://localhost:8443/api/certificate-requests';

  constructor(private http: HttpClient) { }

  // Admin funkcionalnosti - postojeće
  getAllCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.adminApiUrl}/certificates`);
  }

  issueCertificate(data: any): Observable<any> {
    return this.http.post(`${this.adminApiUrl}/certificates/issue`, data);
  }

  revokeAdminCertificate(serialNumber: string, reason: string): Observable<any> {
    return this.http.post(`${this.adminApiUrl}/certificates/${serialNumber}/revoke`, { reason });
  }

  addCaUser(data: any): Observable<any> {
    return this.http.post(`${this.adminApiUrl}/ca-user`, data);
  }

  // Nove funkcionalnosti za CSR zahteve
  submitCsrRequest(formData: FormData): Observable<any> {
    return this.http.post(`${this.csrApiUrl}/submit`, formData);
  }

  getUserCsrRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.csrApiUrl}/my-requests`);
  }

  getAllCsrRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.csrApiUrl}/all`);
  }

  approveCsrRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.csrApiUrl}/${requestId}/approve`, {});
  }

  rejectCsrRequest(requestId: number, reason: string): Observable<any> {
    return this.http.post(`${this.csrApiUrl}/${requestId}/reject`, { reason });
  }

  // Nove funkcionalnosti za korisničke sertifikate
  getUserCertificates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.userApiUrl}/my-certificates`);
  }

  getCertificateDetails(certificateId: number): Observable<any> {
    return this.http.get<any>(`${this.userApiUrl}/${certificateId}/details`);
  }

  downloadCertificate(certificateId: number): Observable<Blob> {
    return this.http.get(`${this.userApiUrl}/${certificateId}/download`, {
      responseType: 'blob'
    });
  }

  // Redefinisana metoda za povlačenje sertifikata od strane korisnika
  revokeCertificate(certificateId: number, reason: string): Observable<any> {
    return this.http.post(`${this.userApiUrl}/${certificateId}/revoke`, { reason });
  }

  // Dohvata dostupne CA sertifikate za potpisivanje
  getAvailableCaCertificates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.userApiUrl}/ca-certificates`);
  }
}
