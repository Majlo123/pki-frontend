import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CertificateService } from '../../services/certificate.service';
import { Router } from '@angular/router';
import { CertificateDetails } from '../../models/certificate.model';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-ca-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ca-dashboard.component.html',
  styleUrls: ['./ca-dashboard.component.scss']
})
export class CADashboardComponent implements OnInit {
  certificates: CertificateDetails[] = [];
  isLoading = true;

  constructor(
    public authService: AuthService,
    private certificateService: CertificateService,
    private router: Router
  ) {}

  get currentUserEmail() {
    return this.authService.currentUserEmail;
  }

  get currentUserRole() {
    return this.authService.currentUserRole;
  }

  ngOnInit() {
    this.loadUserCertificates();
  }

  loadUserCertificates() {
    this.isLoading = true;
    this.certificateService.getOrganizationCertificates().subscribe({
      next: (data) => {
        this.certificates = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Greška pri učitavanju sertifikata', err);
        this.isLoading = false;
        
      }
    });
  }
  download(serialNumber: string) {
    this.certificateService.downloadCertificate(serialNumber).subscribe({
      next: (blob) => {
        saveAs(blob, `${serialNumber}.crt`);
      },
      error: (err) => console.error('Greška pri preuzimanju', err)
    });
  }

  revoke(serialNumber: string) { 
    const reason = prompt("Unesite razlog za opoziv sertifikata:");
    if (reason) {
      this.certificateService.revokeCertificate(serialNumber, reason).subscribe({
        next: () => {
          alert('Sertifikat uspešno opozvan.');
          this.loadUserCertificates();
        },
        error: (err) => alert('Greška pri opozivu: ' + err.error.message)
      });
    }
  }
  goToIssueCertificatePage() { 
    this.router.navigate(['/issue-certificate']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}