import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import { RootStoreState } from '@store';
import { PostsStoreActions } from '@store/posts-store';
import { ReportPostRequest } from '@models/posts';
import { STRINGS } from '@assets/strings/en';
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'spot-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  @Input() modalId: string;
  @Input() itemId: string;

  STRINGS = STRINGS.MAIN.REPORT;

  constructor(private store$: Store<RootStoreState.State>, private modalService: ModalService) { }

  ngOnInit() {
  }

  closeReport() {
    this.modalService.close(this.modalId);
  }

  sendReport() {
    const request: ReportPostRequest = {
      postId: this.itemId,
      content: ''
    };
    this.store$.dispatch(
      new PostsStoreActions.ReportRequestAction(request)
    );
  }

}
