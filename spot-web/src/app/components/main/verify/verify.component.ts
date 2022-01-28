import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { AccountsActions, AccountsStoreSelectors } from '@store/accounts-store';

// Services
import { AccountsService } from '@services/accounts.service';
import { TranslateService } from '@ngx-translate/core';

// Assets
import { Account, VerifyConfirmRequest, VerifyRequest } from '@models/accounts';

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
  account$: Observable<Account>;

  constructor(
    private route: ActivatedRoute,
    private accountsService: AccountsService,
    private store$: Store<RootStoreState.State>,
    private translateService: TranslateService
  ) {
    this.translateService.get('MAIN.VERIFY').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    // Account
    this.account$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccount)
    );

    this.route.paramMap.subscribe((p) => {
      const token = p.get('token');

      const request: VerifyConfirmRequest = {
        token
      };

      this.accountsService
        .verifyConfirmAccount(request)
        .pipe(takeUntil(this.onDestroy))
        .subscribe(
          (response) => {
            this.successMessage = this.STRINGS.SUCCESS;

            this.store$.dispatch(
              new AccountsActions.VerifyConfirmRequestAction(response)
            );
          },
          (err: any) => {
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
    this.store$.dispatch(new AccountsActions.VerifyRequestAction(request));
    this.verificationSent = true;
  }
}
