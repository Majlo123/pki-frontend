import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CertificateService } from '../../services/certificate.service';
import { Router } from '@angular/router';

interface CACertificate {
  id: number;
  subject: string;
  serialNumber: string;
}

interface CsrResponse {
  id: number;
  subject: string;
  requestDate: string;
  status: string;
}

@Component({
  selector: 'app-csr-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './csr-upload.component.html',
  styleUrls: ['./csr-upload.component.scss']
})
export class CsrUploadComponent implements OnInit {
  csrForm: FormGroup;
  availableCAs: CACertificate[] = [];
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  private csrFile: File | null = null;
  private privateKeyFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private certificateService: CertificateService,
    private router: Router
  ) {
    this.csrForm = this.fb.group({
      caCertificateId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAvailableCAs();
  }

  loadAvailableCAs(): void {
    console.log('Loading available CAs...');
    this.certificateService.getAvailableCaCertificates().subscribe({
      next: (cas) => {
        console.log('Available CAs loaded:', cas);
        console.log('First CA object:', cas[0]);
        this.availableCAs = cas;
      },
      error: (error) => {
        console.error('Error loading CAs - Full error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.errorMessage = 'Greška pri učitavanju CA sertifikata: ' + (error.error?.message || error.message);
      }
    });
  }

  onCsrFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.csrFile = file;
      this.errorMessage = '';
    }
  }

  onPrivateKeyFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.privateKeyFile = file;
    }
  }

  onSubmit(): void {
    console.log('Form values:', this.csrForm.value);
    console.log('Form valid:', this.csrForm.valid);
    console.log('CSR file:', this.csrFile);
    
    if (!this.csrForm.valid || !this.csrFile) {
      this.errorMessage = 'Molimo unesite sve obavezne podatke';
      return;
    }

    const caCertificateId = this.csrForm.value.caCertificateId;
    console.log('Selected CA ID:', caCertificateId, typeof caCertificateId);
    
    if (!caCertificateId || caCertificateId === '' || caCertificateId === 'undefined') {
      this.errorMessage = 'Molimo izaberite CA sertifikat';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('csrFile', this.csrFile);
    if (this.privateKeyFile) {
      formData.append('privateKeyFile', this.privateKeyFile);
    }
    formData.append('caCertificateId', caCertificateId.toString());

    this.certificateService.submitCsrRequest(formData).subscribe({
      next: (response: CsrResponse) => {
        this.isSubmitting = false;
        this.successMessage = `CSR zahtev je uspešno poslat! ID zahteva: ${response.id}`;
        this.resetForm();
        
        // Navigraj na "Moji zahtevi" tab nakon 2 sekunde
        setTimeout(() => {
          // Ako je korisnik na User Dashboard, navigiraj na CSR Requests tab
          this.router.navigate(['/user/dashboard'], { 
            queryParams: { tab: 'csr-requests' } 
          });
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.error || 'Greška pri slanju CSR zahteva';
        console.error('Error submitting CSR:', error);
      }
    });
  }

  private resetForm(): void {
    this.csrForm.reset();
    this.csrFile = null;
    this.privateKeyFile = null;
    // Reset file inputs
    const csrInput = document.getElementById('csrFile') as HTMLInputElement;
    const keyInput = document.getElementById('privateKeyFile') as HTMLInputElement;
    if (csrInput) csrInput.value = '';
    if (keyInput) keyInput.value = '';
  }
}
