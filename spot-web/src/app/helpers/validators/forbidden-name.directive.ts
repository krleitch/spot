import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function forbiddenNameValidator(
  nameRe: RegExp,
  type: 'allow' | 'forbidden'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const test = nameRe.test(control.value);
    if (type === 'allow') {
      // The regex is what is allowed
      return !test ? { forbiddenName: { value: control.value } } : null;
    } else {
      // The regex is what is not allowed
      return test ? { forbiddenName: { value: control.value } } : null;
    }
  };
}
