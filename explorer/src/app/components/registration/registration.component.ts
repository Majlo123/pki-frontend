import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  passwordStrength: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      organization: ['']
    });
  }

  estimateStrength(password: string) {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    this.passwordStrength = score;
    return score;
  }

  onPasswordInput() {
    const password = this.registrationForm.get('password')?.value;
    this.estimateStrength(password);
  }

  register() {
    this.errorMessage = '';
    
    if (this.registrationForm.invalid) {
      this.errorMessage = 'Popunite sva obavezna polja.';
      this.registrationForm.markAllAsTouched();
      return;
    }
    if (this.registrationForm.value.password !== this.registrationForm.value.confirmPassword) {
      this.errorMessage = 'Lozinke se ne poklapaju.';
      return;
    }
    this.isLoading = true;
    this.authService.register(this.registrationForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Uspeh: možeš preusmeriti korisnika ili prikazati poruku
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error || 'Došlo je do greške. Pokušajte ponovo.';
      }
    });
  }
}
