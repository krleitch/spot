import { Component, Input, OnDestroy, OnInit } from '@angular/core';

// rxjs
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

// store
import { RootStoreState } from '@store';
import { Store } from '@ngrx/store';

// services
import { ModalService } from '@services/modal.service';
import { PostsService } from '@services/posts.service';
import { AlertService } from '@services/alert.service';
import { CommentService } from '@services/comments.service';
import { TranslateService } from '@ngx-translate/core';

// assets
import { ReportPostRequest, ReportPostSuccess } from '@models/posts';
import { ReportCommentRequest } from '@models/comments';
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
    postId: null,
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
    private postsService: PostsService,
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
    if (this.data.postId && this.data.commentId) {
      const request: ReportCommentRequest = {
        postId: this.data.postId,
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
          (response: ReportPostSuccess) => {
            this.content = '';
            this.modalService.close(this.modalId);
            this.alertService.success(this.STRINGS.SUCCESS_MESSAGE);
          },
          (error: SpotError) => {
            this.errorMessage = error.message;
          }
        );
    } else if (this.data.postId) {
      const request: ReportPostRequest = {
        postId: this.data.postId,
        content: this.content || '',
        category: this.category
      };

      this.postsService
        .reportPost(request)
        .pipe(
          takeUntil(this.onDestroy),
          catchError((errorResponse) => {
            return throwError(errorResponse.error);
          })
        )
        .subscribe(
          (response: ReportPostSuccess) => {
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
