import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificateService } from '../../services/certificate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-csr-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './csr-requests.component.html',
  styleUrl: './csr-requests.component.scss'
})
export class CsrRequestsComponent implements OnInit {
  requests: any[] = [];
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private certificateService: CertificateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    console.log('Loading user CSR requests...');
    console.log('Auth token:', localStorage.getItem('pki_admin_token'));
    console.log('User email:', localStorage.getItem('pki_admin_email'));
    
    this.isLoading = true;
    this.certificateService.getUserCsrRequests().subscribe({
      next: (requests) => {
        console.log('User CSR requests loaded:', requests);
        this.requests = requests;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading CSR requests:', error);
        console.error('Error status:', error.status);
        console.error('Error response body:', error.error);
        this.errorMessage = 'Greška pri učitavanju zahteva: ' + (error.error?.message || error.message);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'APPROVED': return 'badge-success';
      case 'REJECTED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING': return 'Na čekanju';
      case 'APPROVED': return 'Odobreno';
      case 'REJECTED': return 'Odbačeno';
      default: return status;
    }
  }

  viewIssuedCertificate(certificateId: number): void {
    this.router.navigate(['/user/certificates'], { queryParams: { highlight: certificateId } });
  }

  refreshRequests(): void {
    this.loadRequests();
  }
}
