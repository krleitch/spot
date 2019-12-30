import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.LOGIN;

  form: FormGroup;
  errorMessage: string;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      emailOrUser: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
  }

  signIn() {
    const val = this.form.value;

    if (!val.emailOrUser) {
      this.errorMessage = this.STRINGS.EMAIL_OR_USER_ERROR;
      this.form.controls.emailOrUser.markAsDirty();
      return;
    }

    if (!val.password) {
      this.errorMessage = this.STRINGS.PASSWORD_ERROR;
      this.form.controls.password.markAsDirty();
      return;
    }

    this.errorMessage = '';
  }

  register() {
    this.router.navigateByUrl('/register');
  }

}
