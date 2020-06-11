import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';

import { RootStoreState } from '@store';
import { PostsService } from '@services/posts.service';
import { LoadSinglePostRequest, Post } from '@models/posts';
import { Location } from '@models/accounts';
import { AccountsStoreSelectors } from '@store/accounts-store';

@Component({
  selector: 'spot-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailComponent implements OnInit {

  constructor(private route: ActivatedRoute, private postsService: PostsService, private store$: Store<RootStoreState.State>) { }

  post$: Observable<Post>;

  location$: Observable<Location>;
  myLocation: Location;
  locationEnabled = false;

  commentId: string;

  ngOnInit() {

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsLocation)
    );

    this.location$.subscribe( (location: Location) => {
      this.myLocation = location;

      // don't load unless we have a location
      if ( this.myLocation ) {

        this.route.paramMap.subscribe( p => {

          this.commentId = p.get('commentId');

          const request: LoadSinglePostRequest = {
            postLink: p.get('postId'),
            location: this.myLocation
          };

          this.post$ = this.postsService.getPost(request).pipe(
            map( postSuccess =>  {
              if ( this.commentId ) {
                postSuccess.post.startCommentId = this.commentId;
              }
              return postSuccess.post;
            })
          );

        });

      }

    });

  }

  getPostLink(post: Post) {
    return window.location.origin + '/posts/' + post.link;
  }

}
