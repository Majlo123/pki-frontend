import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CertificateService } from '../../services/certificate.service';

interface Certificate {
  id: number;
  serialNumber: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  revoked: boolean;
  revocationReason?: string;
  revocationDate?: string;
  ca: boolean;
  type: string;
}

@Component({
  selector: 'app-user-certificates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-certificates.component.html',
  styleUrl: './user-certificates.component.scss'
})
export class UserCertificatesComponent implements OnInit {
  certificates: Certificate[] = [];
  selectedCertificate: Certificate | null = null;
  showRevokeModal = false;
  certificateToRevoke: Certificate | null = null;
  revokeForm: FormGroup;

  isLoading = false;
  isRevoking = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private certificateService: CertificateService,
    private fb: FormBuilder
  ) {
    this.revokeForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserCertificates();
  }

  loadUserCertificates(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.certificateService.getUserCertificates().subscribe({
      next: (certificates) => {
        this.certificates = certificates;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Greška pri učitavanju sertifikata';
        console.error('Error loading certificates:', error);
      }
    });
  }

  viewCertificateDetails(certificateId: number): void {
    this.certificateService.getCertificateDetails(certificateId).subscribe({
      next: (certificate) => {
        this.selectedCertificate = certificate;
      },
      error: (error) => {
        this.errorMessage = 'Greška pri učitavanju detalja sertifikata';
        console.error('Error loading certificate details:', error);
      }
    });
  }

  downloadCertificate(certificateId: number): void {
    this.certificateService.downloadCertificate(certificateId).subscribe({
      next: (blob) => {
        const certificate = this.certificates.find(c => c.id === certificateId);
        const filename = `certificate_${certificate?.serialNumber || certificateId}.pem`;

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);

        this.successMessage = 'Sertifikat je uspešno preuzet';
      },
      error: (error) => {
        this.errorMessage = 'Greška pri preuzimanju sertifikata';
        console.error('Error downloading certificate:', error);
      }
    });
  }

  revokeCertificate(certificate: Certificate): void {
    this.certificateToRevoke = certificate;
    this.showRevokeModal = true;
    this.revokeForm.reset();
  }

  confirmRevoke(): void {
    if (!this.revokeForm.valid || !this.certificateToRevoke) {
      return;
    }

    this.isRevoking = true;
    const reason = this.revokeForm.value.reason;

    this.certificateService.revokeCertificate(this.certificateToRevoke.id, reason).subscribe({
      next: (response) => {
        this.isRevoking = false;
        this.showRevokeModal = false;
        this.successMessage = 'Sertifikat je uspešno povučen';
        this.loadUserCertificates(); // Refresh the list
      },
      error: (error) => {
        this.isRevoking = false;
        this.errorMessage = error.error?.error || 'Greška pri povlačenju sertifikata';
        console.error('Error revoking certificate:', error);
      }
    });
  }

  closeModal(): void {
    this.selectedCertificate = null;
  }

  closeRevokeModal(): void {
    this.showRevokeModal = false;
    this.certificateToRevoke = null;
    this.revokeForm.reset();
  }

  getCertificateStatus(certificate: Certificate): string {
    if (certificate.revoked) {
      return 'Povučen';
    }

    const now = new Date();
    const validTo = new Date(certificate.validTo);

    if (validTo < now) {
      return 'Istekao';
    }

    return 'Aktivan';
  }

  getCertificateStatusClass(certificate: Certificate): string {
    if (certificate.revoked) {
      return 'badge-danger';
    }

    const now = new Date();
    const validTo = new Date(certificate.validTo);

    if (validTo < now) {
      return 'badge-warning';
    }

    return 'badge-success';
  }
}
