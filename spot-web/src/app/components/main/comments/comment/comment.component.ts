import { Component, OnInit, Input } from '@angular/core';

import { Comment } from '@models/comments';

@Component({
  selector: 'spot-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Input() comment: Comment;

  constructor() { }

  ngOnInit() {
  }

}
