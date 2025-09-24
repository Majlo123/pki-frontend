import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CertificateService } from '../../services/certificate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  certificates: any[] = [];

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
    // Učitaj sertifikate trenutnog korisnika
    // Implementiraćeš ovo kasnije kada bude potreban endpoint
    this.certificates = [];
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}