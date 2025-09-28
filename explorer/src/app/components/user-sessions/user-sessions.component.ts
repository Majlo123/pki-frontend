import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { AuthService } from '../../services/auth.service';
import { JwtSession } from '../../core/model/jwt-session.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-sessions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-sessions.component.html',
  styleUrl: './user-sessions.component.scss'
})
export class UserSessionsComponent implements OnInit {
  sessions = signal<JwtSession[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadActiveSessions();
  }

  loadActiveSessions(): void {
    // Proveravamo da li koristimo JWT sistem
    console.log('🔑 Provera JWT sistema:', this.authService.useJwt());
    console.log('💾 Current token type:', this.authService.getToken()?.substring(0, 10));
    
    if (!this.authService.useJwt()) {
      this.errorMessage.set('Sesije su dostupne samo za JWT autentifikaciju. Trenutno koristite Basic Auth.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.sessionService.getActiveSessions().subscribe({
      next: (sessions) => {
        console.log('✅ Sesije uspešno učitane:', sessions);
        this.sessions.set(sessions);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Greška pri učitavanju sesija:', error);
        this.errorMessage.set('Greška prilikom učitavanja sesija: ' + (error.error?.message || error.message));
        this.isLoading.set(false);
      }
    });
  }

  revokeSession(sessionId: number): void {
    if (!confirm('Da li ste sigurni da želite da opozvete ovu sesiju?')) {
      return;
    }

    this.isLoading.set(true);
    this.sessionService.revokeSession(sessionId).subscribe({
      next: () => {
        this.successMessage.set('Sesija je uspešno opozvana.');
        this.loadActiveSessions(); // Ponovno učitavanje sesija
        // Uklanjamo poruku posle 3 sekunde
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set('Greška prilikom opoziva sesije: ' + (error.error?.message || error.message));
        this.isLoading.set(false);
      }
    });
  }

  revokeAllOtherSessions(): void {
    if (!confirm('Da li ste sigurni da želite da opozvete sve druge sesije? Ova akcija će vas odjaviti sa svih drugih uređaja.')) {
      return;
    }

    this.isLoading.set(true);
    this.sessionService.revokeAllSessions().subscribe({
      next: () => {
        this.successMessage.set('Sve sesije su uspešno opozvane.');
        this.loadActiveSessions(); // Ponovno učitavanje sesija
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set('Greška prilikom opoziva sesija: ' + (error.error?.message || error.message));
        this.isLoading.set(false);
      }
    });
  }

  logoutFromCurrentSession(): void {
    if (!confirm('Da li ste sigurni da se želite odjaviti sa trenutne sesije?')) {
      return;
    }

    this.sessionService.revokeCurrentSession().subscribe({
      next: () => {
        // Nakon uspešnog opoziva, pozivamo logout da očistimo localStorage i preusmerimo
        this.authService.logout();
      },
      error: (error) => {
        // Čak i u slučaju greške, odjavimo korisnika lokalno
        console.error('Greška prilikom opoziva trenutne sesije:', error);
        this.authService.logout();
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('sr-RS');
  }

  getDeviceInfo(userAgent?: string): string {
    if (!userAgent) return 'Nepoznat uređaj';
    
    // Jednostavno parsiranje user agent-a za prikazivanje
    if (userAgent.includes('Chrome')) return 'Chrome browser';
    if (userAgent.includes('Firefox')) return 'Firefox browser';
    if (userAgent.includes('Safari')) return 'Safari browser';
    if (userAgent.includes('Edge')) return 'Edge browser';
    if (userAgent.includes('Mobile')) return 'Mobilni uređaj';
    
    return 'Desktop browser';
  }

  isCurrentSession(session: JwtSession): boolean {
    const currentToken = this.authService.getToken();
    // Proveravamo da li je ovo trenutna sesija poređenjem tokena (bez Bearer/Basic prefiksa)
    const sessionToken = session.token;
    const cleanCurrentToken = currentToken?.replace('Bearer ', '').replace('Basic ', '');
    const cleanSessionToken = sessionToken?.replace('Bearer ', '').replace('Basic ', '');
    
    return cleanCurrentToken === cleanSessionToken;
  }
}