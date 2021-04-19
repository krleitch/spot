import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// rxjs
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Store
import { Store } from '@ngrx/store';
import { RootStoreState } from '@store';
import { AccountsActions } from '@store/accounts-store';

// Services
import { AccountsService } from '@services/accounts.service';

// Assets
import { VerifyConfirmRequest, VerifyRequest } from '@models/accounts';
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  STRINGS = STRINGS.MAIN.VERIFY;

  successMessage = '';
  errorMessage = '';
  verificationSent = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private accountsService: AccountsService,
              private store$: Store<RootStoreState.State>) { }

  ngOnInit(): void {

    this.route.paramMap.subscribe( p => {

      const token = p.get('token');

      const request: VerifyConfirmRequest = {
        token
      };

      this.accountsService.verifyConfirmAccount(request).pipe(takeUntil(this.onDestroy)).subscribe( (response) => {

        this.successMessage = this.STRINGS.SUCCESS;

        this.store$.dispatch(
          new AccountsActions.VerifyConfirmRequestAction(response)
        );

      }, (err: any) => {

        this.errorMessage = this.STRINGS.FAILURE;

      });

    });

  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  continue(): void {
    this.router.navigateByUrl('/home');
  }

  sendVerification(): void {
    const request: VerifyRequest = {};
    this.store$.dispatch(
      new AccountsActions.VerifyRequestAction(request)
    );
    this.verificationSent = true;
  }

}
