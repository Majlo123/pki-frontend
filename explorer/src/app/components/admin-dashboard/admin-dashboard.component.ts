import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificateService,Template} from '../../services/certificate.service';
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
  templates = signal<Template[]>([]);
  // Stanje za modale
  showIssueModal = signal(false);
  showAddCaUserModal = signal(false);
  showRevokeModal = signal(false);
  showTemplateModal = signal(false);
  // Podaci za forme u modalima
  issueModalData = this.getInitialIssueData();
  addCaUserData = { email: '', firstName: '', lastName: '', organization: '' };
  revokeModalData = { serialNumber: '', reason: 'Unspecified' };
  templateModalData = this.getInitialTemplateData();

  successMessage = signal('');
  errorMessage = signal('');

  constructor(private certificateService: CertificateService) {}

   ngOnInit(): void {
    // Ažurirano da učitava sve potrebne podatke na početku
    this.loadInitialData();
  }

  // <<<< AŽURIRANO: Sada učitava i sertifikate i šablone pri startu
  loadInitialData(): void {
    this.isLoading.set(true);
    Promise.all([
      this.certificateService.getAllCertificates().toPromise(),
      this.certificateService.getAllTemplates().toPromise()
    ]).then(([certs, tmpls]) => {
      if (certs) {
        this.certificates.set(certs);
        this.caCertificates.set(certs.filter(c => (c.type === 'ROOT' || c.type === 'INTERMEDIATE') && !c.revoked));
      }
      if (tmpls) {
        this.templates.set(tmpls);
      }
      this.isLoading.set(false);
    }).catch(err => {
      this.handleError(this.extractErrorMessage(err));
      this.isLoading.set(false);
    });
  }
  loadCertificates(): void {
    this.certificateService.getAllCertificates().subscribe({
      next: data => {
        this.certificates.set(data);
        this.caCertificates.set(data.filter(c => (c.type === 'ROOT' || c.type === 'INTERMEDIATE') && !c.revoked));
      }
    });
  }
  loadTemplates(): void {
     this.certificateService.getAllTemplates().subscribe({
      next: data => this.templates.set(data)
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
    next: res => {
      // ako backend šalje "text" kao poruku uspeha
      if (res?.text) {
        this.handleSuccess(res.text);
      } else {
        this.handleSuccess('Sertifikat je uspešno izdat.');
      }
      this.loadCertificates();
    },
    error: err => {
      const msg = err.error?.message || err.error?.text || err.error || 'Greška prilikom izdavanja sertifikata.';
      this.handleError(msg);
    }
  });
}
onCreateTemplate(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.certificateService.createTemplate(this.templateModalData).subscribe({
      next: () => {
        this.loadTemplates(); // Osvežavamo samo listu šablona
        this.handleSuccess('Šablon je uspešno kreiran.');
      },
      error: err => this.handleError(this.extractErrorMessage(err))
    });
  }
openTemplateModal(): void {
    this.templateModalData = this.getInitialTemplateData();
    this.showTemplateModal.set(true);
  }


 onAddCaUser(): void {
  this.isLoading.set(true);
  this.errorMessage.set('');
  this.certificateService.addCaUser(this.addCaUserData).subscribe({
    next: res => {
      const message = res?.text || 'CA korisnik je uspešno dodat.';
      this.handleSuccess(message);
    },
    error: err => {
      const msg = this.extractErrorMessage(err);
      this.handleError(msg);
    }
  });
}

  onRevokeCertificate(): void {
  this.isLoading.set(true);
  this.errorMessage.set('');
  this.certificateService.revokeAdminCertificate(
    this.revokeModalData.serialNumber,
    this.revokeModalData.reason
  ).subscribe({
    next: res => {
      const message = res?.text || 'Sertifikat je uspešno povučen.';
      this.handleSuccess(message);
    },
    error: err => {
      const msg = this.extractErrorMessage(err);
      this.handleError(msg);
    }
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
    this.showTemplateModal.set(false);
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
  getInitialTemplateData(): Omit<Template, 'id'> {
    return {
      name: '',
      commonNameRegex: '.*',
      subjectAlternativeNamesRegex: '.*',
      timeToLiveDays: 365,
      keyUsage: 'digitalSignature',
      extendedKeyUsage: 'serverAuth,clientAuth'
    };
  }

private handleSuccess(message: string): void {
  this.successMessage.set(message);
  this.isLoading.set(false);
  this.closeAllModals();

  // Sačekaj kratko, pa osveži listu
  setTimeout(() => {
    this.loadCertificates();
    this.successMessage.set('');
  }, 1000);
}



private handleError(message: string): void {
  this.errorMessage.set(message);
  this.isLoading.set(false);

  setTimeout(() => {
    this.loadCertificates();
    this.successMessage.set('');
  }, 1000);
}
private extractErrorMessage(err: any): string {
  if (!err) return 'Došlo je do greške.';
  if (typeof err === 'string') return err;
  if (typeof err.error === 'string') return err.error;
  if (err.error?.text) return err.error.text;
  if (err.error?.message) return err.error.message;
  if (err.message) return err.message;
  return JSON.stringify(err);
}

  getCommonName(dn: string): string {
    if (!dn) return 'N/A (Self-Signed)';
    const match = dn.match(/CN=([^,]+)/);
    return match ? match[1] : dn;
  }
 openIssueModal(): void {
    this.issueModalData = this.getInitialIssueData();
    this.showIssueModal.set(true);
  }
}


