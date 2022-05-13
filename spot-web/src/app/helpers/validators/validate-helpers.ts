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

// client side validation for which use regex
export function validateEmail(email: string): boolean {
  const regex = /^\S+@\S+\.\S+$/;
  return email.match(regex) !== null;
}

export function validatePhone(phone: string): boolean {
  const regex =
    /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
  return phone.match(regex) !== null;
}

export function validateUsername(username: string): boolean {
  // alphanumeric starting with a letter (_ and - allowed)
  const regex = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
  return username.match(regex) !== null;
}

export function validatePassword(password: string): boolean {
  // one letter, one number, and one special character
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])$/;
  return password.match(regex) !== null;
}
