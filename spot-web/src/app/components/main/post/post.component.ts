import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { take } from 'rxjs/operators';

import { RootStoreState } from '@store';
import { PostsStoreActions } from '@store/posts-store';
import { LikePostRequest, DislikePostRequest, DeletePostRequest, Post } from '@models/posts';
import { Location, AccountMetadata } from '@models/accounts';
import { ModalService } from '@services/modal.service';
import { AccountsStoreSelectors } from '@store/accounts-store';

import { POSTS_CONSTANTS } from '@constants/posts';
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  @Input() detailed: boolean;
  @Input() post: Post;
  @ViewChild('options') options: ElementRef;

  STRINGS = STRINGS.MAIN.POST;
  POSTS_CONSTANTS = POSTS_CONSTANTS;

  location$: Observable<Location>;
  accountMetadata$: Observable<AccountMetadata>;
  location: Location;

  expanded = false;
  isExpandable = false;

  optionsEnabled = false;

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private modalService: ModalService) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit() {

    this.accountMetadata$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountMetadata)
    );

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsLocation)
    );

    this.location$.pipe(takeUntil(this.onDestroy)).subscribe( (location: Location) => {
      this.location = location;
    });

    if ( this.post.content.split(/\r\n|\r|\n/).length > POSTS_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH
         || this.post.content.length > POSTS_CONSTANTS.MAX_TRUNCATE_LENGTH ) {
      this.isExpandable = true;
    }

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  offClickHandler(event: MouseEvent) {
    if (!this.options.nativeElement.contains(event.target)) {
      this.setOptions(false);
    }
  }

  setOptions(value): void {
    this.optionsEnabled = value;
  }

  openPost(): void {
    this.router.navigateByUrl('posts/' + this.post.link);
  }

  deletePost() {

    this.modalService.open('spot-confirm-modal');

    const result$ = this.modalService.getResult('spot-confirm-modal').pipe(take(1));

    result$.subscribe( (result: { status: string }) => {

      if ( result.status === 'confirm' ) {

        const request: DeletePostRequest = {
          postId: this.post.id
        };
        this.store$.dispatch(
          new PostsStoreActions.DeleteRequestAction(request)
        );

      }

    });

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

  getDistance(distance: number, unit: string) {
    if ( unit === 'kilometers' ) {
      return (distance * 1.60934).toFixed(1) + ' km';
    } else {
      return distance.toFixed(1) + ' m';
    }
  }

  getContent(): string {

    if ( this.expanded || !this.isExpandable ) {
      return this.post.content;
    }

    const textArrays = this.post.content.split(/\r\n|\r|\n/);
    let truncatedContent = '';

    for (let i = 0; i < textArrays.length && i < POSTS_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH; i++ ) {

      if ( truncatedContent.length + textArrays[i].length > POSTS_CONSTANTS.MAX_TRUNCATE_LENGTH ) {
        truncatedContent = textArrays[i].substring(0, POSTS_CONSTANTS.MAX_TRUNCATE_LENGTH - truncatedContent.length);
        break;
      } else {
        truncatedContent += textArrays[i];
        // Dont add newline for last line or last line before line length reached
        if ( i !== textArrays.length - 1 && i !== POSTS_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH - 1) {
          truncatedContent += '\n';
        }
      }

    }

    return truncatedContent + ' ...';

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

  setExpanded(value: boolean): void {
    this.expanded = value;
  }

  openModal(id: string, data?: any): void {
    if ( data ) {
      this.modalService.open(id, data);
    } else {
      this.modalService.open(id);
    }
  }

  closeModal(id: string): void {
    this.modalService.close(id);
  }

}
