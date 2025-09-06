import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // RouterOutlet se mora importovati ovde
  template: `
    <!-- Ovde će se prikazivati vaše rute (login, admin-dashboard, itd.) -->
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'pki-frontend';
}
