import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { PostsStoreActions } from '@store/posts-store';
import { LikePostRequest, DislikePostRequest, DeletePostRequest, Post, ReportPostRequest } from '@models/posts';
import { Location } from '@models/accounts';
import { PostsService } from '@services/posts.service';
import { ModalService } from '@services/modal.service';
import { AccountsStoreSelectors } from '@store/accounts-store';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

  @Input() detailed: boolean;
  @Input() post: Post;
  @ViewChild('options') options;
  @ViewChild('share') share;

  STRINGS = STRINGS.MAIN.POST;

  location$: Observable<Location>;
  myLocation: Location;

  MAX_POST_LENGTH = 300;
  expanded = false;

  optionsEnabled = false;
  showShare = false;
  showReport = false;

  expandImage = false;

  constructor(private store$: Store<RootStoreState.State>, private router: Router, private postsService: PostsService,
              private modalService: ModalService) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit() {

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsLocation)
    );

    this.location$.subscribe( (location: Location) => {
      this.myLocation = location;
    });

  }

  offClickHandler(event: MouseEvent) {
    if (!this.options.nativeElement.contains(event.target)) {
      this.setOptions(false);
    }

    if (!this.share.nativeElement.contains(event.target)) {
      this.showShare = false;
    }
  }

  setOptions(value) {
    this.optionsEnabled = value;
  }

  deletePost() {
    const request: DeletePostRequest = {
      postId: this.post.id
    };
    this.store$.dispatch(
      new PostsStoreActions.DeleteRequestAction(request)
    );
  }

  openPost() {
    this.router.navigateByUrl('posts/' + this.post.link);
  }

  getTime() {
    const curTime = new Date();
    const postTime = new Date(this.post.creation_date);
    const timeDiff = curTime.getTime() - postTime.getTime();
    if (timeDiff < 60000) {
      const secDiff = Math.round(timeDiff / 1000);
      if (secDiff === 0) {
        return 'Now';
      } else {
        return secDiff + 's';
      }
    } else if (timeDiff < 3600000) {
      const minDiff = Math.round(timeDiff / 60000);
      return minDiff + 'm';
    } else if (timeDiff < 86400000) {
      const hourDiff = Math.round(timeDiff / 3600000);
      return hourDiff + 'h';
    } else if (timeDiff < 31536000000) {
      const dayDiff = Math.round(timeDiff / 86400000);
      return dayDiff + 'd';
    } else {
      const yearDiff = Math.round(timeDiff / 31536000000);
      return yearDiff + 'y';
    }
  }

  getDistance() {
    return this.postsService.calcDistance(this.post.latitude, this.post.longitude, this.myLocation.latitude,
                                           this.myLocation.longitude, 'M').toFixed(1) + ' miles';
  }

  getContent(): string {
    // https://css-tricks.com/line-clampin/
    if (this.expandable() && !this.expanded) {
      return this.post.content.substring(0, this.MAX_POST_LENGTH) + ' ...';
    } else {
      return this.post.content;
    }
  }

  like() {
    if (this.post.rated !== 1) {
      const request: LikePostRequest = {
        postId: this.post.id
      };
      this.store$.dispatch(
        new PostsStoreActions.LikeRequestAction(request)
      );
    }
  }

  dislike() {
    if (this.post.rated !== 0) {
      const request: DislikePostRequest = {
        postId: this.post.id
      };
      this.store$.dispatch(
        new PostsStoreActions.DislikeRequestAction(request)
      );
    }
  }

  // For show more on post content
  expandable(): boolean {
    return this.post.content.length > this.MAX_POST_LENGTH;
  }

  setExpanded(value: boolean) {
    this.expanded = value;
  }

  // Share events
  toggleShare() {
    this.showShare = !this.showShare;
  }

  onClose() {
    this.showShare = false;
  }

  onReportClose() {
    this.showReport = false;
  }

  // For expanding images
  setExpandImageTrue() {
    this.expandImage = true;
  }

  setExpandImageFalse() {
    this.expandImage = false;
  }

  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

}
