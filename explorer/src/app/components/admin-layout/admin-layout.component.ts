import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <<<<<< DODATO OVO
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common'; // Potreban za @if

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet, // <<<<<< DODATO OVO
    CommonModule
  ],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {

  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}

