import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CertificateService } from '../../services/certificate.service';
import { Router } from '@angular/router';
import { CertificateDetails } from '../../models/certificate.model';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
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
        // Ovde možeš dodati prikaz poruke o grešci
      }
    });
  }
  download(serialNumber: string) { // NOVO
    this.certificateService.downloadCertificate(serialNumber).subscribe({
      next: (blob) => {
        saveAs(blob, `${serialNumber}.crt`); // Koristi file-saver
      },
      error: (err) => console.error('Greška pri preuzimanju', err)
    });
  }

  revoke(serialNumber: string) { // NOVO
    const reason = prompt("Unesite razlog za opoziv sertifikata:");
    if (reason) {
      this.certificateService.revokeCertificate(serialNumber, reason).subscribe({
        next: () => {
          alert('Sertifikat uspešno opozvan.');
          this.loadUserCertificates(); // Ponovo učitaj listu
        },
        error: (err) => alert('Greška pri opozivu: ' + err.error.message)
      });
    }
  }
  goToIssueCertificatePage() { // NOVO
    this.router.navigate(['/issue-certificate']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}