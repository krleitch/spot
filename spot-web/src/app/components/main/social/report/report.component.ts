import { Component, OnInit } from '@angular/core';

// rxjs
import { take } from 'rxjs/operators';

// services
import { ModalService } from '@services/modal.service';
import { SpotService } from '@src/app/services/spot.service';
import { AlertService } from '@services/alert.service';
import { CommentService } from '@src/app/services/comment.service';
import { TranslateService } from '@ngx-translate/core';

// models
import { ReportSpotRequest, ReportSpotResponse } from '@models/spot';
import { ReportCommentRequest } from '@models/comment';
import { ReportCategory } from '@models/report';
import { SpotError } from '@exceptions/error';
import { ModalReportData } from '@models/modal';

// constants
import { REPORT_CONSTANTS } from '@constants/report';

@Component({
  selector: 'spot-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  // modal props
  modalId: string;
  data: ModalReportData = {
    spotId: null,
    commentId: null
  };

  // constants
  STRINGS: Record<string, string>;
  REPORT_CONSTANTS = REPORT_CONSTANTS;
  eReportCategory = ReportCategory;

  // state
  content = '';
  errorMessage = '';
  category = ReportCategory.OFFENSIVE;

  constructor(
    private modalService: ModalService,
    private spotService: SpotService,
    private commentService: CommentService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {
    this.translateService
      .get('MAIN.REPORT')
      .subscribe((strings: Record<string, string>) => {
        this.STRINGS = strings;
      });
  }

  ngOnInit(): void {
    this.content = '';
  }

  closeReport(): void {
    this.modalService.close(this.modalId);
  }

  sendReport(): void {

    if ( this.content.length > 300 ) {
      this.errorMessage = this.STRINGS.ERROR_CONTENT_LENGTH;
      return;
    }

    if (this.data.spotId && this.data.commentId) {
      // report a comment
      const request: ReportCommentRequest = {
        spotId: this.data.spotId,
        commentId: this.data.commentId,
        content: this.content,
        category: this.category
      };

      this.commentService
        .reportComment(request)
        .pipe(take(1))
        .subscribe(
          (_response: ReportSpotResponse) => {},
          (_errorResponse: { error: SpotError }) => {}
        );
    } else if (this.data.spotId) {
      // report a spot
      const request: ReportSpotRequest = {
        spotId: this.data.spotId,
        content: this.content,
        category: this.category
      };

      this.spotService
        .reportSpot(request)
        .pipe(take(1))
        .subscribe(
          (_response: ReportSpotResponse) => {},
          (_errorResponse: { error: SpotError }) => {}
        );
    }
    this.modalService.close(this.modalId);
    this.alertService.success(this.STRINGS.SUCCESS_MESSAGE);
  }
}
