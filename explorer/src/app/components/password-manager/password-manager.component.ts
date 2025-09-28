import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PasswordManagerService, PasswordEntry, PasswordStats } from '../../services/password-manager.service';
import { CertificateService } from '../../services/certificate.service';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';

export interface Certificate {
  id: number;
  serialNumber: string;
  subject: string;
  validFrom: string;
  validTo: string;
  revoked: boolean;
}

@Component({
  selector: 'app-password-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './password-manager.component.html',
  styleUrls: ['./password-manager.component.scss']
})
export class PasswordManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private dataLoaded = false;
  passwordEntries: PasswordEntry[] = [];
  userCertificates: Certificate[] = [];
  filteredEntries: PasswordEntry[] = [];

  passwordForm: FormGroup;
  editForm: FormGroup;

  showAddForm = false;
  showEditForm = false;
  editingEntry: PasswordEntry | null = null;

  searchTerm = '';
  selectedFile: File | null = null;

  stats: PasswordStats = {
    totalPasswordEntries: 0,
    activeCertificates: 0
  };

  constructor(
    private fb: FormBuilder,
    private passwordService: PasswordManagerService,
    private certificateService: CertificateService,
    private authService: AuthService
  ) {
    this.passwordForm = this.fb.group({
      siteName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      certificateId: ['', [Validators.required]],
      description: ['']
    });

    this.editForm = this.fb.group({
      siteName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    console.log('🎯 PasswordManager ngOnInit pozvan');
    
    // Koristimo effect da pratimo promene u authentication state
    effect(() => {
      const isLoggedIn = this.authService.isLoggedIn();
      const hasToken = !!this.authService.getToken();
      
      console.log('🔄 Auth state promena - logovan:', isLoggedIn, ', token:', hasToken);
      
      if (isLoggedIn && hasToken && !this.dataLoaded) {
        console.log('✅ Korisnik je ulogovan i ima token, učitavam podatke...');
        // Dodajemo kratko kašnjenje da se token sigurno sačuva u localStorage
        setTimeout(() => {
          this.loadData();
          this.dataLoaded = true;
        }, 200);
      }
    });

    // Ako je korisnik već ulogovan kada se komponenta inicijalizuje
    if (this.authService.isLoggedIn() && this.authService.getToken()) {
      console.log('✅ Korisnik je već ulogovan, učitavam podatke odmah...');
      setTimeout(() => {
        this.loadData();
        this.dataLoaded = true;
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.loadPasswordEntries();
    this.loadUserCertificates();
    this.loadStats();
  }

  loadPasswordEntries(): void {
    console.log('📋 Učitavam password entries...');
    this.passwordService.getPasswordEntries().subscribe({
      next: (entries: PasswordEntry[]) => {
        console.log('✅ Password entries uspešno učitani:', entries.length);
        this.passwordEntries = entries;
        this.filteredEntries = [...entries];
      },
      error: (error: any) => {
        console.error('❌ Error loading password entries:', error);
        alert('Error loading password entries: ' + (error.error || error.message));
      }
    });
  }

  loadUserCertificates(): void {
    this.certificateService.getUserCertificates().subscribe({
      next: (certificates: Certificate[]) => {
        // Filter only active (non-revoked) certificates
        this.userCertificates = certificates.filter(cert => !cert.revoked);
      },
      error: (error: any) => {
        console.error('Error loading certificates:', error);
      }
    });
  }

  loadStats(): void {
    this.passwordService.getPasswordStats().subscribe({
      next: (stats: PasswordStats) => {
        this.stats = stats;
      },
      error: (error: any) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/x-pkcs12') {
      this.selectedFile = file;
    } else {
      alert('Please select a valid .p12 certificate file');
      event.target.value = '';
    }
  }

  async encryptPassword(password: string, certificateId: number): Promise<string> {
    if (!this.selectedFile) {
      throw new Error('Please select a certificate file');
    }

    try {
      // Read the certificate file
      const arrayBuffer = await this.selectedFile.arrayBuffer();

      // For demonstration, we'll use a simple base64 encoding
      // In a real implementation, you would extract the public key from the certificate
      // and use it to encrypt the password using Web Crypto API

      // This is a placeholder - you should implement proper RSA encryption here
      const encryptedPassword = btoa(password); // Base64 encoding as placeholder

      return encryptedPassword;
    } catch (error) {
      throw new Error('Failed to encrypt password: ' + error);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.passwordForm.valid && this.selectedFile) {
      try {
        const formValue = this.passwordForm.value;
        const encryptedPassword = await this.encryptPassword(formValue.password, formValue.certificateId);

        const request = {
          siteName: formValue.siteName,
          username: formValue.username,
          encryptedPassword: encryptedPassword,
          certificateId: formValue.certificateId,
          description: formValue.description
        };

        this.passwordService.createPasswordEntry(request).subscribe({
          next: (entry: PasswordEntry) => {
            this.passwordEntries.push(entry);
            this.filteredEntries = [...this.passwordEntries];
            this.passwordForm.reset();
            this.selectedFile = null;
            this.showAddForm = false;
            this.loadStats();
            alert('Password entry created successfully');
          },
          error: (error: any) => {
            console.error('Error creating password entry:', error);
            alert('Error creating password entry: ' + (error.error || error.message));
          }
        });
      } catch (error) {
        alert('Error encrypting password: ' + error);
      }
    }
  }

  editEntry(entry: PasswordEntry): void {
    this.editingEntry = entry;
    this.editForm.patchValue({
      siteName: entry.siteName,
      username: entry.username,
      password: '', // Don't populate password for security
      description: entry.description
    });
    this.showEditForm = true;
  }

  async onUpdateSubmit(): Promise<void> {
    if (this.editForm.valid && this.editingEntry) {
      try {
        const formValue = this.editForm.value;
        let encryptedPassword = this.editingEntry.encryptedPassword;

        // Only encrypt new password if provided
        if (formValue.password) {
          if (!this.selectedFile) {
            alert('Please select a certificate file to encrypt the new password');
            return;
          }
          encryptedPassword = await this.encryptPassword(formValue.password, this.editingEntry.certificateId);
        }

        const request = {
          siteName: formValue.siteName,
          username: formValue.username,
          encryptedPassword: encryptedPassword,
          certificateId: this.editingEntry.certificateId,
          description: formValue.description
        };

        this.passwordService.updatePasswordEntry(this.editingEntry.id, request).subscribe({
          next: (updatedEntry: PasswordEntry) => {
            const index = this.passwordEntries.findIndex(e => e.id === this.editingEntry!.id);
            if (index !== -1) {
              this.passwordEntries[index] = updatedEntry;
              this.filteredEntries = [...this.passwordEntries];
            }
            this.editForm.reset();
            this.editingEntry = null;
            this.selectedFile = null;
            this.showEditForm = false;
            alert('Password entry updated successfully');
          },
          error: (error: any) => {
            console.error('Error updating password entry:', error);
            alert('Error updating password entry: ' + (error.error || error.message));
          }
        });
      } catch (error) {
        alert('Error encrypting password: ' + error);
      }
    }
  }

  deleteEntry(entry: PasswordEntry): void {
    if (confirm(`Are you sure you want to delete the password entry for ${entry.siteName}?`)) {
      this.passwordService.deletePasswordEntry(entry.id).subscribe({
        next: () => {
          this.passwordEntries = this.passwordEntries.filter(e => e.id !== entry.id);
          this.filteredEntries = [...this.passwordEntries];
          this.loadStats();
          alert('Password entry deleted successfully');
        },
        error: (error: any) => {
          console.error('Error deleting password entry:', error);
          alert('Error deleting password entry: ' + (error.error || error.message));
        }
      });
    }
  }

  searchEntries(): void {
    if (this.searchTerm.trim()) {
      this.passwordService.searchPasswordEntries(this.searchTerm).subscribe({
        next: (entries: PasswordEntry[]) => {
          this.filteredEntries = entries;
        },
        error: (error: any) => {
          console.error('Error searching entries:', error);
        }
      });
    } else {
      this.filteredEntries = [...this.passwordEntries];
    }
  }

  async decryptPassword(entry: PasswordEntry): Promise<void> {
    if (!this.selectedFile) {
      alert('Please select your private key certificate file to decrypt the password');
      return;
    }

    try {
      // This is a placeholder implementation
      // In a real scenario, you would use the Web Crypto API to decrypt using the private key
      const decryptedPassword = atob(entry.encryptedPassword); // Base64 decoding as placeholder

      // Show decrypted password in a secure manner
      const userConfirmed = confirm(`Decrypted password for ${entry.siteName}: ${decryptedPassword}\n\nClick OK to copy to clipboard`);
      if (userConfirmed) {
        await navigator.clipboard.writeText(decryptedPassword);
        alert('Password copied to clipboard');
      }
    } catch (error) {
      alert('Error decrypting password. Make sure you selected the correct certificate file.');
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.passwordForm.reset();
    this.selectedFile = null;
  }

  cancelEdit(): void {
    this.showEditForm = false;
    this.editForm.reset();
    this.editingEntry = null;
    this.selectedFile = null;
  }
}
