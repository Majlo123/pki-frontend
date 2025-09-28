import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificateService } from '../../services/certificate.service';
import { Certificate } from '../../core/model/certificate.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule], // Dodajemo FormsModule za rad sa formama
  templateUrl: './admin-dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  certificates = signal<Certificate[]>([]);
  caCertificates = signal<Certificate[]>([]); // Lista samo CA sertifikata za dropdown
  isLoading = signal(true);

  // Stanje za modale
  showIssueModal = signal(false);
  showAddCaUserModal = signal(false);
  showRevokeModal = signal(false);

  // Podaci za forme u modalima
  issueModalData = this.getInitialIssueData();
  addCaUserData = { email: '', firstName: '', lastName: '', organization: '' };
  revokeModalData = { serialNumber: '', reason: 'Unspecified' };

  successMessage = signal('');
  errorMessage = signal('');

  constructor(private certificateService: CertificateService) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.isLoading.set(true);
    this.certificateService.getAllCertificates().subscribe({
      next: data => {
        this.certificates.set(data);
        // Filtriramo samo aktivne CA sertifikate koje možemo koristiti kao izdavaoce
        this.caCertificates.set(data.filter(c => (c.type === 'ROOT' || c.type === 'INTERMEDIATE') && !c.revoked));
        this.isLoading.set(false);
      },
      error: err => {
        this.handleError('Nije moguće učitati sertifikate.');
        this.isLoading.set(false);
      }
    });
  }

  // --- Logika za forme ---
  onIssueCertificate(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    const request = {
      type: this.issueModalData.type,
      issuerSerialNumber: this.issueModalData.type === 'ROOT' ? null : this.issueModalData.issuerSerialNumber,
      validFrom: new Date(this.issueModalData.validFrom).toISOString(),
      validTo: new Date(this.issueModalData.validTo).toISOString(),
      subjectData: this.issueModalData.subjectData
    };
    this.certificateService.issueCertificate(request).subscribe({
      next: () => {
        this.handleSuccess('Sertifikat je uspešno izdat.');
        this.loadCertificates();
      },
      error: err => this.handleError(err.error?.message || err.error || 'Greška prilikom izdavanja sertifikata.')
    });
  }

  onAddCaUser(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.certificateService.addCaUser(this.addCaUserData).subscribe({
      next: () => this.handleSuccess('CA korisnik je uspešno dodat.'),
      error: err => this.handleError(err.error?.message || err.error || 'Greška prilikom dodavanja korisnika.')
    });
  }

  onRevokeCertificate(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.certificateService.revokeAdminCertificate(this.revokeModalData.serialNumber, this.revokeModalData.reason).subscribe({
      next: () => {
        this.handleSuccess('Sertifikat je uspešno povučen.');
        this.loadCertificates();
      },
      error: err => this.handleError(err.error?.message || err.error || 'Greška prilikom povlačenja sertifikata.')
    });
  }

  // --- Pomoćne metode ---

  openRevokeModal(serialNumber: string): void {
    this.revokeModalData = { serialNumber, reason: 'Unspecified' };
    this.showRevokeModal.set(true);
  }

  closeAllModals(): void {
    this.showIssueModal.set(false);
    this.showAddCaUserModal.set(false);
    this.showRevokeModal.set(false);
    this.errorMessage.set('');
  }

  getInitialIssueData() {
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
    return {
      type: 'END_ENTITY',
      issuerSerialNumber: '',
      validFrom: today,
      validTo: nextYear,
      subjectData: {
        commonName: '', organization: '', organizationalUnit: '', country: 'RS', email: ''
      }
    };
  }

  private handleSuccess(message: string): void {
    this.successMessage.set(message);
    this.isLoading.set(false);
    this.closeAllModals();
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  private handleError(message: string): void {
    this.errorMessage.set(message);
    this.isLoading.set(false);
  }

  getCommonName(dn: string): string {
    if (!dn) return 'N/A (Self-Signed)';
    const match = dn.match(/CN=([^,]+)/);
    return match ? match[1] : dn;
  }
}

