import { Component, OnInit, Input } from '@angular/core';

import { Comment } from '@models/comments';

@Component({
  selector: 'spot-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.scss']
})
export class ReplyComponent implements OnInit {

  @Input() reply: Comment;

  constructor() { }

  ngOnInit() {
  }

}
