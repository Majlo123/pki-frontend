import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common'; // Potreban za @if
import { FormsModule } from '@angular/forms';    // <<<<<< DODATO OVO

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule // <<<<<< DODATO OVO
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginDetails = { email: '', password: '' };
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.authService.login(this.loginDetails.email, this.loginDetails.password).subscribe(success => {
      this.isLoading.set(false);
      if (success) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.errorMessage.set('Pogrešan email ili lozinka.');
      }
    });
  }
}

