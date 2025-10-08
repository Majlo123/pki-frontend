import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Certificate } from '../core/model/certificate.model';
import { CertificateDetails, IssueCertificateRequest, IssuerDetails } from '../models/certificate.model';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private adminApiUrl = 'https://localhost:8443/api/admin';
  private caApiUrl = 'https://localhost:8443/api/certificates';
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
  // NOVO: Dobavlja sve sertifikate (backend će filtrirati na osnovu uloge)
  getOrganizationCertificates(): Observable<CertificateDetails[]> {
    return this.http.get<CertificateDetails[]>(this.caApiUrl);
  }
    // NOVO: Povlači sertifikat
  revokeCACertificate(serialNumber: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.caApiUrl}/${serialNumber}/revoke`, { reason });
  }

  // Vraća samo validne CA sertifikate koji se mogu koristiti kao izdavaoci
  getAvailableIssuers(): Observable<IssuerDetails[]> {
    return this.getOrganizationCertificates().pipe(
      map(certs => 
        certs
          .filter(cert => cert.type === 'ROOT' || cert.type === 'INTERMEDIATE') // 1. Filtriraj samo CA
          .map(cert => ({                                                      // 2. Mapiraj u IssuerDetails format
            serialNumber: cert.serialNumber,
            commonName: cert.subjectCommonName,
            validTo: cert.validTo
          }))
      )
    );
  }

  // NOVO: Šalje zahtev za izdavanje novog sertifikata
  issueCACertificate(request: IssueCertificateRequest): Observable<any> {
    return this.http.post(`${this.caApiUrl}/issue`, request);
  }

 

  // NOVO: Preuzima sertifikat (vraća fajl)
  downloadNewCertificate(serialNumber: string): Observable<Blob> {
    return this.http.get(`${this.caApiUrl}/${serialNumber}/download`, {
      responseType: 'blob'
    });
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
    revokeNewCertificate(serialNumber: string, reason: string): Observable<any> {
    return this.http.post(`${this.adminApiUrl}/certificates/${serialNumber}/revoke`, { reason });
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
