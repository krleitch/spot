import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'spot-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.scss']
})
export class ReplyComponent implements OnInit {

  @Input() commentId: string;

  constructor() { }

  ngOnInit() {
  }

}
