import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.LANDING;

  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  facebookLogin() {

  }

  googleLogin() {

  }

  signUp() {

  }

  login() {
    this.router.navigateByUrl('/login');
  }


}
