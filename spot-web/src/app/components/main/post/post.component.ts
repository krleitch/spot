import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { RootStoreState } from '@store';
import { PostsStoreActions } from '@store/posts-store';
import { LikePostRequest, DislikePostRequest, DeletePostRequest, Post, ReportPostRequest } from '@models/posts';
import { Location, AccountMetadata } from '@models/accounts';
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
  @ViewChild('options') options: ElementRef;
  @ViewChild('content') content: ElementRef;

  STRINGS = STRINGS.MAIN.POST;

  location$: Observable<Location>;
  accountMetadata$: Observable<AccountMetadata>;
  myLocation: Location;

  MAX_POST_LENGTH = 300;
  MAX_LINE_LENGTH = 3;
  expanded = false;

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

    this.location$.subscribe( (location: Location) => {
      this.myLocation = location;
    });

  }

  offClickHandler(event: MouseEvent) {
    if (!this.options.nativeElement.contains(event.target)) {
      this.setOptions(false);
    }
  }

  setOptions(value) {
    this.optionsEnabled = value;
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

  getDistance(distance: number, unit: string) {
    if ( unit === 'kilometers' ) {
      return (distance * 1.60934).toFixed(1) + ' km';
    } else {
      return distance.toFixed(1) + ' m';
    }
  }

  // For show more on post content
  expandable(): boolean {
    // return this.post.content.length > this.MAX_POST_LENGTH;

    if ( this.post.content.split(/\r\n|\r|\n/).length > this.MAX_LINE_LENGTH ) {
      return true;
    }

    if ( this.post.content.length > this.MAX_POST_LENGTH ) {
      return true;
    }

    return false;

  }

  getContent(): string {

    if ( !this.expanded ) {

      let textArrays = this.post.content.split(/\r\n|\r|\n/);
      let truncatedContent = '';

      for (let i = 0; i < textArrays.length; i++ ) {

        if ( i < this.MAX_LINE_LENGTH ) {

          if ( truncatedContent.length + textArrays[i].length > this.MAX_POST_LENGTH ) {
            truncatedContent = textArrays[i].substring(0, this.MAX_POST_LENGTH - truncatedContent.length);
            textArrays = textArrays.slice(this.MAX_LINE_LENGTH - 1);
            break;
          } else {
            truncatedContent += textArrays[i];
            if ( i !== textArrays.length - 1 ) {
              truncatedContent += '\n';
            }
          }

        }

      }
      return truncatedContent + '...';
    } else {
      return this.post.content;
    }

    console.log(this.post.content,  this.post.content.split(/\r\n|\r|\n/).length)

    // https://css-tricks.com/line-clampin/
    return this.post.content;
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

  setExpanded(value: boolean) {
    this.expanded = value;
  }

  openModal(id: string, data?: any) {

    if ( data ) {
      this.modalService.open(id, data);
    } else {
      this.modalService.open(id);
    }

  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

}
