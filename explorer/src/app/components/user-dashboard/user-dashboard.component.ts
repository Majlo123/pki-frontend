import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CertificateService } from '../../services/certificate.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserCertificatesComponent } from '../user-certificates/user-certificates.component';
import { CsrUploadComponent } from '../csr-upload/csr-upload.component';
import { CsrRequestsComponent } from '../csr-requests/csr-requests.component';
import { UserSessionsComponent } from '../user-sessions/user-sessions.component';
import { PasswordManagerComponent } from '../password-manager/password-manager.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, UserCertificatesComponent, CsrUploadComponent, CsrRequestsComponent, UserSessionsComponent, PasswordManagerComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  certificates: any[] = [];
  activeTab: string = 'certificates';

  constructor(
    public authService: AuthService,
    private certificateService: CertificateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get currentUserEmail() {
    return this.authService.currentUserEmail;
  }

  get currentUserRole() {
    return this.authService.currentUserRole;
  }

  ngOnInit() {
    this.loadUserCertificates();

    // Proveri da li postoji 'tab' query parameter
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
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