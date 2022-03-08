import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// rxjs
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

// store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import {
  UserActions,
  UserStoreSelectors
} from '@src/app/root-store/user-store';

// services
import { AuthenticationService } from '@services/authentication.service';
import { UserService } from '@src/app/services/user.service';
import { ModalService } from '@services/modal.service';
import { TranslateService } from '@ngx-translate/core';

import {
  User,
  UpdateUsernameRequest,
  UpdateUsernameResponse
} from '@models/user';
import { SpotError } from '@exceptions/error';

@Component({
  selector: 'spot-username',
  templateUrl: './username.component.html',
  styleUrls: ['./username.component.scss']
})
export class UsernameComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  STRINGS;

  user$: Observable<User>;
  username: string;
  terms: boolean;
  errorMessage: string;
  buttonsDisabled = false;

  constructor(
    private store$: Store<RootStoreState.State>,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private modalService: ModalService,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.translateService.get('PRE_AUTH.USERNAME').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    this.user$ = this.store$.pipe(select(UserStoreSelectors.selectUser));

    this.user$.pipe(takeUntil(this.onDestroy)).subscribe((user: User) => {
      if (user) {
        this.username = user.username;
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  // Send the request
  continueToSpot(): void {
    if (this.buttonsDisabled) {
      return;
    }

    if (!this.terms) {
      this.errorMessage = this.STRINGS.TERMS_ERROR;
      return;
    }

    if (!this.username) {
      this.errorMessage = this.STRINGS.USERNAME_ERROR;
      return;
    }

    const validUsername = this.authenticationService.validateUsername(
      this.username
    );
    if (validUsername !== null) {
      this.errorMessage = validUsername;
      return;
    }

    const request: UpdateUsernameRequest = {
      username: this.username
    };

    this.buttonsDisabled = true;
    this.userService
      .updateUsername(request)
      .pipe(take(1))
      .subscribe(
        (response: UpdateUsernameResponse) => {
          this.buttonsDisabled = false;
          this.store$.dispatch(new UserActions.UpdateUsernameAction(request));

          this.router.navigateByUrl('/home');
        },
        (err: { error: SpotError }) => {
          this.errorMessage = err.error.message;
          this.buttonsDisabled = false;
        }
      );
  }

  openTerms(): void {
    this.modalService.open('global', 'terms');
  }
}
