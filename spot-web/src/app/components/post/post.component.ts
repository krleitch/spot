import { Component, OnInit, Input, ViewChild} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PostsStoreActions, PostsStoreSelectors, RootStoreState } from '../../root-store';

@Component({
  selector: 'spot-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

  @Input() post: any;

  @ViewChild('dropdown') dropdown;

  timeMessage: string;
  expanded: boolean = false;
  dropEnabled: boolean = false;

  constructor(private store$: Store<RootStoreState.State>) { 
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  offClickHandler(event:any) {
    if (!this.dropdown.nativeElement.contains(event.target)) {
      this.showDropdown(false);
    }
  }

  ngOnInit() {
    this.getTime(this.post.creation_date);
  }

  getTime(date) {
    const curTime = new Date();
    const postTime = new Date(date);
    const timeDiff = curTime.getTime() - postTime.getTime();
    if (timeDiff < 60000) {
      const secDiff = Math.round(timeDiff/1000);
      this.timeMessage = secDiff + " second" + (secDiff == 1 ? "" : "s") +  " ago"
    } else if (timeDiff < 3600000) {
      const minDiff = Math.round(timeDiff/60000);
      this.timeMessage = minDiff + " minute"+ (minDiff == 1 ? "" : "s") + " ago";
    } else if (timeDiff < 86400000) {
      const hourDiff = Math.round(timeDiff/3600000);
      this.timeMessage = hourDiff + " hour" + (hourDiff == 1 ? "" : "s") + " ago";
    } else {
      this.timeMessage = postTime.getMonth() + 1 + "/" + postTime.getDate() + "/" + postTime.getFullYear();
    }
  }

  expand() {
    this.expanded = !this.expanded;
  }

  showDropdown(value) {
    this.dropEnabled = value;
  }

  deletePost() {
    var request: any = {
      Id: this.post.id
    };
    this.store$.dispatch(
      new PostsStoreActions.DeleteRequestAction(request)
    )
  }

  likePost() {
    var request: any = {
      Id: this.post.id
    };
    this.store$.dispatch(
      new PostsStoreActions.LikeRequestAction(request)
    )
  }

  dislikePost() {
    var request: any = {
      Id: this.post.id
    };
    this.store$.dispatch(
      new PostsStoreActions.DislikeRequestAction(request)
    )
  }

}
