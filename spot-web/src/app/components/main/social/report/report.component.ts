import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, throwError } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

import { RootStoreState } from '@store';
import { CommentsStoreActions } from '@store/comments-store';
import { ReportPostRequest, ReportPostSuccess } from '@models/posts';
import { ReportCommentRequest } from '@models/comments';
import { SpotError } from '@exceptions/error';
import { STRINGS } from '@assets/strings/en';
import { ModalService } from '@services/modal.service';
import { PostsService } from '@services/posts.service';
import { AlertService } from '@services/alert.service';
import { CommentService } from '@services/comments.service';

@Component({
  selector: 'spot-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  @Input() modalId: string;

  data$: Observable<any>;
  data: { postId: string, commentId?: string } = { postId: null, commentId: null };

  STRINGS = STRINGS.MAIN.REPORT;
  content: string;

  errorMessage = '';

  constructor(private store$: Store<RootStoreState.State>,
              private modalService: ModalService,
              private postsService: PostsService,
              private commentService: CommentService,
              private alertService: AlertService) { }

  ngOnInit() {

    this.data$ = this.modalService.getData(this.modalId);
    // { commentId: reply.id, postId: reply.post_id }
    this.data$.subscribe( (val) => {

      if ( val.commentId ) {
        this.data.commentId = val.commentId;
      }

      this.data.postId = val.postId;

    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  closeReport() {
    this.modalService.close(this.modalId);
  }

  sendReport() {

    if ( this.data.postId && this.data.commentId ) {

      const request: ReportCommentRequest = {
        postId: this.data.postId,
        commentId: this.data.commentId,
        content: this.content
      };

      this.commentService.reportComment(request).pipe(
        takeUntil(this.onDestroy),
        catchError( errorResponse => {
          return throwError(errorResponse.error);
        })
      ).subscribe( (response: ReportPostSuccess ) => {
        this.content = '';
        this.modalService.close(this.modalId);
        this.alertService.success(this.STRINGS.SUCCESS_MESSAGE);
      }, ( error: SpotError ) => {
        this.errorMessage = error.message;
      });

    } else if ( this.data.postId ) {

      const request: ReportPostRequest = {
        postId: this.data.postId,
        content: this.content || ''
      };

      this.postsService.reportPost(request).pipe(
        takeUntil(this.onDestroy),
        catchError( errorResponse => {
          return throwError(errorResponse.error);
        })
      ).subscribe( (response: ReportPostSuccess ) => {
        this.content = '';
        this.modalService.close(this.modalId);
        this.alertService.success(this.STRINGS.SUCCESS_MESSAGE);
      }, ( error: SpotError ) => {
        this.errorMessage = error.message;
      });

    }

  }

}
