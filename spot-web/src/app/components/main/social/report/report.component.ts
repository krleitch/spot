import { Component, Input, OnDestroy, OnInit } from '@angular/core';

// rxjs
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

// store
import { RootStoreState } from '@store';
import { Store } from '@ngrx/store';

// services
import { ModalService } from '@services/modal.service';
import { SpotService } from '@src/app/services/spot.service';
import { AlertService } from '@services/alert.service';
import { CommentService } from '@src/app/services/comment.service';
import { TranslateService } from '@ngx-translate/core';

// assets
import { ReportSpotRequest, ReportSpotResponse } from '@models/spot';
import { ReportCommentRequest } from '@models/comment';
import { ReportCategory } from '@models/report';
import { SpotError } from '@exceptions/error';
import { REPORT_CONSTANTS } from '@constants/report';
import { ModalReportData } from '@models/modal';

@Component({
  selector: 'spot-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  // MODAL
  modalId: string;
  data: ModalReportData = {
    spotId: null,
    commentId: null
  };

  STRINGS;
  REPORT_CONSTANTS = REPORT_CONSTANTS;

  content = '';
  category = ReportCategory.OFFENSIVE;
  errorMessage = '';

  constructor(
    private store$: Store<RootStoreState.State>,
    private modalService: ModalService,
    private spotService: SpotService,
    private commentService: CommentService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {
    this.translateService.get('MAIN.REPORT').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  closeReport(): void {
    this.modalService.close(this.modalId);
  }

  invalidLength(): boolean {
    return this.content.length > REPORT_CONSTANTS.MAX_CONTENT_LENGTH;
  }

  sendReport(): void {
    if (this.data.spotId && this.data.commentId) {
      const request: ReportCommentRequest = {
        spotId: this.data.spotId,
        commentId: this.data.commentId,
        content: this.content,
        category: this.category
      };

      this.commentService
        .reportComment(request)
        .pipe(
          takeUntil(this.onDestroy),
          catchError((errorResponse) => {
            return throwError(errorResponse.error);
          })
        )
        .subscribe(
          (response: ReportSpotResponse) => {
            this.content = '';
            this.modalService.close(this.modalId);
            this.alertService.success(this.STRINGS.SUCCESS_MESSAGE);
          },
          (error: SpotError) => {
            this.errorMessage = error.message;
          }
        );
    } else if (this.data.spotId) {
      const request: ReportSpotRequest = {
        spotId: this.data.spotId,
        content: this.content || '',
        category: this.category
      };

      this.spotService
        .reportSpot(request)
        .pipe(
          takeUntil(this.onDestroy),
          catchError((errorResponse) => {
            return throwError(errorResponse.error);
          })
        )
        .subscribe(
          (response: ReportSpotResponse) => {
            this.content = '';
            this.modalService.close(this.modalId);
            this.alertService.success(this.STRINGS.SUCCESS_MESSAGE);
          },
          (error: SpotError) => {
            this.errorMessage = error.message;
          }
        );
    }
  }
}
