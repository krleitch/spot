import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';

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
  @Input() postId: string;
  @Input() commentId: string;

  STRINGS = STRINGS.MAIN.REPORT;
  content: string;

  constructor(private store$: Store<RootStoreState.State>, private modalService: ModalService) { }

  ngOnInit() {
  }

  closeReport() {
    this.modalService.close(this.modalId);
  }

  sendReport() {

    if ( this.postId && this.commentId ) {

      const request: ReportCommentRequest = {
        postId: this.postId,
        commentId: this.commentId,
        content: this.content
      };
      this.store$.dispatch(
        new CommentsStoreActions.ReportRequestAction(request)
      );

    } else if ( this.postId ) {

      const request: ReportPostRequest = {
        postId: this.postId,
        content: this.content || ''
      };
      this.store$.dispatch(
        new PostsStoreActions.ReportRequestAction(request)
      );

    }

  }

}
