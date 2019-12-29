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

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      emailOrUser: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
  }

  register() {
    this.router.navigateByUrl('/register');
  }

}
