import { FormControl, FormGroup } from '@angular/forms';

// Forms
export function validateAllFormFields(formGroup: FormGroup) {
  Object.keys(formGroup.controls).forEach((field) => {
    const control = formGroup.get(field);
    if (control instanceof FormControl) {
      control.markAsTouched({ onlySelf: true });
      control.markAsDirty({ onlySelf: true });
    } else if (control instanceof FormGroup) {
      // recursive call
      this.validateAllFormFields(control);
    }
  });
}

// validation for lengths and required are done in the form
// these helpers are for keeping the regex consistent between seperate forms

// just check for an @ and a .
export const VALID_EMAIL_REGEX = /^\S+@\S+\.\S+$/;
// correct number of digits in either form
export const VALID_PHONE_REGEX = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
// alphanumeric starting with a letter (_ and - and . allowed)
export const VALID_USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_\-\.]*$/;
// one letter, one number, and one special character
export const VALID_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

