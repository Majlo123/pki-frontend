import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Importi za standalone komponente
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, // Potreban za *ngIf
    FormsModule   // Potreban za [(ngModel)]
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    this.authService.login(this.credentials).subscribe({
      next: () => {
        const user = this.authService.currentUserValue;
        if (user && user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.errorMessage = 'Access denied. You do not have administrator privileges.';
          this.authService.logout();
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else {
          this.errorMessage = 'An error occurred. Please try again later.';
        }
        console.error(err);
      }
    });
  }
}
