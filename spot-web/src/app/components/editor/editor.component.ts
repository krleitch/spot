import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'spot-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  @Output() content = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {}

  submit() {
    var contenteditable = document.querySelector('[contenteditable]');
    this.content.emit({
      content: contenteditable.textContent
    });
  }

  bold() {
    document.execCommand('bold', false, null);
  }

  underline() {
    document.execCommand('underline', false, null);
  }

  heading() {
    document.execCommand('formatBlock', false, '<H1>');
  }

}
