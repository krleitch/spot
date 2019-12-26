import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '@src/app/services/auth.service';
import { Router } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { AccountsActions, RootStoreState } from '@store';
import { Subscription } from 'rxjs';
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  form: FormGroup;
  myActions = new Subscription();
  errorMessage: string;

  STRINGS = STRINGS.REGISTER;

  ngOnInit() {}

  constructor(private fb: FormBuilder, 
               private authenticationService: AuthenticationService, 
               private router: Router,
               private store$: Store<RootStoreState.State>,
               private actions$: ActionsSubject) {

      this.form = this.fb.group({
          email: ['', Validators.required],
          password: ['', Validators.required],
          confirm: ['', Validators.required]
      });
  }

  ngOnDestroy() {
    this.myActions.unsubscribe();
  }

  register() {
    const val = this.form.value;

    if (!val.email) {
      this.errorMessage = this.STRINGS.EMAIL_ERROR;
      this.form.controls['email'].markAsDirty()
      return;
    }

    if (!val.password) {
      this.errorMessage = this.STRINGS.PASSWORD_ERROR;
      this.form.controls['password'].markAsDirty()
      return;
    }

    if (!val.confirm) {
      this.errorMessage = this.STRINGS.CONFIRM_ERROR;
      this.form.controls['confirm'].markAsDirty()
      return;
    }

    if (val.password != val.confirm) {
      this.errorMessage = this.STRINGS.MATCH_ERROR;
      this.form.controls['password'].setErrors({'incorrect': true});
      this.form.controls['confirm'].setErrors({'incorrect': true});
      return;
    }

    const request: any = {
      email: val.email,
      password: this.authenticationService.md5Hash(val.password)
    }
    this.store$.dispatch(
        new AccountsActions.RegisterRequestAction(request)
    );

  }

  login() {
    this.router.navigateByUrl('/login');
  }

}
