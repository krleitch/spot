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

// assets
import { ReportPostRequest, ReportPostSuccess } from '@models/posts';
import { ReportCommentRequest } from '@models/comments';
import { ReportCategory } from '@models/report';
import { SpotError } from '@exceptions/error';
import { STRINGS } from '@assets/strings/en';
import { REPORT_CONSTANTS } from '@constants/report';

@Component({
  selector: 'spot-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  @Input() modalId: string;

  data$: Observable<any>;
  data: { postId: string; commentId?: string } = {
    postId: null,
    commentId: null
  };

  STRINGS = STRINGS.MAIN.REPORT;
  REPORT_CONSTANTS = REPORT_CONSTANTS;

  content = '';
  category = ReportCategory.OFFENSIVE;
  errorMessage = '';

  constructor(
    private store$: Store<RootStoreState.State>,
    private modalService: ModalService,
    private postsService: PostsService,
    private commentService: CommentService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.data$ = this.modalService.getData(this.modalId);

    // data type is
    // { commentId: reply.id, postId: reply.post_id }
    this.data$.subscribe((val) => {
      // commentId may not exist
      if (val.commentId) {
        this.data.commentId = val.commentId;
      }

      this.data.postId = val.postId;
      this.content = '';
      this.category = ReportCategory.OFFENSIVE;
    });
  }

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
