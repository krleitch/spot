import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { PostsService } from '@services/posts.service';
import { LoadSinglePostRequest, Post } from '@models/posts';

@Component({
  selector: 'spot-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailComponent implements OnInit {

  constructor(private route: ActivatedRoute, private postsService: PostsService) { }

  post$: Observable<Post>;

  ngOnInit() {
    this.route.paramMap.subscribe( p => {

      const request: LoadSinglePostRequest = {
        postId: p.get('postId')
      };

      this.post$ = this.postsService.getPost(request).pipe(
        map( postSuccess => postSuccess.post)
      );

    });
  }

}
