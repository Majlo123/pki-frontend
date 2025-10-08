// src/app/components/issue-certificate/issue-certificate.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//import { dateValidator, validityPeriodValidator } from './issue-certificate.validators';
import { IssuerDetails } from '../models/certificate.model';
import { CertificateService } from '../services/certificate.service';
import { dateValidator, validityPeriodValidator } from './issue-certificate.validators';

@Component({
  selector: 'app-issue-certificate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './issue-certificate.component.html',
  styleUrls: ['./issue-certificate.component.scss']
})
export class IssueCertificateComponent implements OnInit {
  issueForm: FormGroup;
  availableIssuers: IssuerDetails[] = [];
  selectedIssuer: IssuerDetails | null = null;
  minValidToDate: string = '';
  maxValidToDate: string = '';
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private certificateService: CertificateService,
    private router: Router
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.minValidToDate = today;

    this.issueForm = this.fb.group({
      certificateType: ['END_ENTITY', Validators.required],
      issuerSerialNumber: ['', Validators.required],
      subjectData: this.fb.group({
        commonName: ['', Validators.required],
        organization: ['', Validators.required],
        organizationalUnit: [''],
        country: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
        email: ['', [Validators.required, Validators.email]]
      }),
      validFrom: [{ value: today, disabled: true }],
      validTo: ['', [Validators.required, dateValidator()]]
    }, { validators: validityPeriodValidator() });
  }

  ngOnInit(): void {
    this.loadIssuers();
    this.onIssuerChange();
  }

  loadIssuers() {
    this.certificateService.getAvailableIssuers().subscribe({
      next: (data) => this.availableIssuers = data,
      error: (err) => this.errorMessage = 'Greška pri učitavanju izdavalaca.'
    });
  }

  onIssuerChange(): void {
    this.issueForm.get('issuerSerialNumber')?.valueChanges.subscribe(serial => {
      this.selectedIssuer = this.availableIssuers.find(i => i.serialNumber === serial) || null;
      if (this.selectedIssuer) {
        this.maxValidToDate = new Date(this.selectedIssuer.validTo).toISOString().split('T')[0];
        this.issueForm.get('validTo')?.updateValueAndValidity();
      }
    });
  }

  onSubmit(): void {
    if (this.issueForm.invalid) {
      this.issueForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;

    const formValue = this.issueForm.getRawValue();
    const request = {
      type: formValue.certificateType,
      issuerSerialNumber: formValue.issuerSerialNumber,
      subjectData: formValue.subjectData,
      validFrom: new Date(formValue.validFrom).toISOString(),
      validTo: new Date(formValue.validTo).toISOString(),
    };

    this.certificateService.issueCACertificate(request).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Sertifikat je uspešno izdat!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Došlo je do greške prilikom izdavanja sertifikata.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['ca/dashboard']);
  }
}