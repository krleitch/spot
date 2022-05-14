import { FormControl, FormGroup } from '@angular/forms';

import { AUTHENTICATION_CONSTANTS } from '@constants/authentication';

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
export const VALID_PHONE_REGEX =
  /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
// alphanumeric starting with a letter (_ and - allowed)
export const VALID_USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
// one letter, one number, and one special character
export const VALID_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// client side validation for which use regex
export function validateEmail(email: string): boolean {
  return email.match(VALID_EMAIL_REGEX) !== null;
}
export function validatePhone(phone: string): boolean {
  return phone.match(VALID_PHONE_REGEX) !== null;
}
export function validateUsername(username: string): boolean {
  return username.match(VALID_USERNAME_REGEX) !== null;
}
export function validatePassword(password: string): boolean {
  return password.match(VALID_PASSWORD_REGEX) !== null;
}
