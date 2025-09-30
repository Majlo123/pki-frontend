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
  downloadCertificate(serialNumber: string): Observable<Blob> {
    return this.http.get(`${this.caApiUrl}/${serialNumber}/download`, {
      responseType: 'blob'
    });
  }
}

