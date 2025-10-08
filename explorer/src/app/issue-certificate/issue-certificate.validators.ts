import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) return null;

    const validFrom = parent.get('validFrom')?.value;
    const validTo = control.value;
    const maxDate = (parent.root as any).component?.maxValidToDate;

    if (validTo && validFrom && new Date(validTo) < new Date(validFrom)) {
      return { dateInvalid: 'Datum "Važi do" ne može biti pre datuma "Važi od".' };
    }
    if (validTo && maxDate && new Date(validTo) > new Date(maxDate)) {
      return { dateExceedsIssuer: 'Datum "Važi do" ne može biti nakon isteka sertifikata izdavaoca.' };
    }
    return null;
  };
}

export function validityPeriodValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
        const validFrom = formGroup.get('validFrom')?.value;
        const validTo = formGroup.get('validTo')?.value;
        if (validFrom && validTo && new Date(validTo) <= new Date(validFrom)) {
            return { invalidPeriod: true };
        }
        return null;
    };
}