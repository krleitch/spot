import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { PostsStoreActions } from '@store/posts-store';
import { CommentsStoreActions } from '@store/comments-store';
import { ReportPostRequest } from '@models/posts';
import { ReportCommentRequest } from '@models/comments';
import { STRINGS } from '@assets/strings/en';
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'spot-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  @Input() modalId: string;

  data$: Observable<any>;
  data: { postId: string, commentId?: string } = { postId: null, commentId: null };

  STRINGS = STRINGS.MAIN.REPORT;
  content: string;

  constructor(private store$: Store<RootStoreState.State>, private modalService: ModalService) { }

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
      this.store$.dispatch(
        new CommentsStoreActions.ReportRequestAction(request)
      );

    } else if ( this.data.postId ) {

      const request: ReportPostRequest = {
        postId: this.data.postId,
        content: this.content || ''
      };
      this.store$.dispatch(
        new PostsStoreActions.ReportRequestAction(request)
      );

    }

  }

}
