import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certificate } from '../core/model/certificate.model';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private adminApiUrl = 'https://localhost:8443/api/admin';

  constructor(private http: HttpClient) { }

  // Dohvata sve sertifikate
  getAllCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.adminApiUrl}/certificates`);
  }

  // Izdaje novi sertifikat
  issueCertificate(data: any): Observable<any> {
    return this.http.post(`${this.adminApiUrl}/certificates/issue`, data);
  }

  // Povlači sertifikat
  revokeCertificate(serialNumber: string, reason: string): Observable<any> {
    return this.http.post(`${this.adminApiUrl}/certificates/${serialNumber}/revoke`, { reason });
  }

  // Dodaje novog CA korisnika
  addCaUser(data: any): Observable<any> {
    return this.http.post(`${this.adminApiUrl}/ca-user`, data);
  }
}

