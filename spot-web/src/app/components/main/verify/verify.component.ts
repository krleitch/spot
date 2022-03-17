import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Observable, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import {
  UserActions,
  UserStoreSelectors
} from '@src/app/root-store/user-store';

// Services
import { UserService } from '@src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';

// Assets
import {
  User,
  VerifyConfirmRequest,
  VerifyRequest,
  VerifyResponse,
  VerifyConfirmResponse,
  SetUserStore
} from '@models/user';

@Component({
  selector: 'spot-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  STRINGS;

  successMessage = '';
  errorMessage = '';
  verificationSent = false;
  user$: Observable<User>;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private store$: Store<RootStoreState.State>,
    private translateService: TranslateService
  ) {
    this.translateService.get('MAIN.VERIFY').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    // User
    this.user$ = this.store$.pipe(select(UserStoreSelectors.selectUser));

    this.route.paramMap.subscribe((p) => {
      const token = p.get('token');

      const request: VerifyConfirmRequest = {
        token
      };

      this.userService
        .verifyConfirmUser(request)
        .pipe(takeUntil(this.onDestroy))
        .subscribe(
          (response: VerifyConfirmResponse) => {
            this.successMessage = this.STRINGS.SUCCESS;

            const request: SetUserStore = {
              user: {
                verifiedAt: response.user.verifiedAt
              }
            };
            this.store$.dispatch(new UserActions.SetUserAction(request));
          },
          (_err) => {
            this.errorMessage = this.STRINGS.FAILURE;
          }
        );
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  sendVerification(): void {
    const request: VerifyRequest = {};
    this.userService
      .verifyUser(request)
      .pipe(take(1))
      .subscribe((_response: VerifyResponse) => {
        this.verificationSent = true;
      });
  }
}
