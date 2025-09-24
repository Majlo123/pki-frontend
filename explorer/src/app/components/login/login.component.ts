import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common'; // Potreban za @if
import { FormsModule } from '@angular/forms';    // <<<<<< DODATO OVO
import { RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // <<<<<< DODATO OVO
    RecaptchaModule
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginDetails = { email: '', password: '' };
  errorMessage = signal('');
  isLoading = signal(false);
  captchaResolved = signal(false);
  captchaToken: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onCaptchaResolved(token: string | null): void {
    this.captchaToken = token;
    this.captchaResolved.set(!!token);
  }

  onSubmit(): void {
    if (!this.captchaResolved()) {
      this.errorMessage.set('Molimo rešite CAPTCHA pre prijave.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.authService.login(this.loginDetails.email, this.loginDetails.password, this.captchaToken).subscribe(result => {
      this.isLoading.set(false);
      if (result.success && result.role) {
        // Role-based routing
        switch(result.role) {
          case 'ADMIN':
            this.router.navigate(['/admin/dashboard']);
            break;
          case 'CA_USER':
            // Zasad preusmeriti na user dashboard dok ne napravimo CA dashboard
            this.router.navigate(['/user/dashboard']);
            break;
          case 'END_ENTITY_USER':
            this.router.navigate(['/user/dashboard']);
            break;
          default:
            this.router.navigate(['/user/dashboard']);
        }
      } else {
        this.errorMessage.set('Pogrešan email ili lozinka.');
      }
    });
  }
}

