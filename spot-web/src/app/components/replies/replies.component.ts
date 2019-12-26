import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'spot-replies',
  templateUrl: './replies.component.html',
  styleUrls: ['./replies.component.scss']
})
export class RepliesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  addReply(reply: any) {
    console.log("added reply");
  }

}
