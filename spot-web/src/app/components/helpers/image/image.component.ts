import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'spot-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {

  @Input() imageSrc: string;
  @Output() closeEvent = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  close() {
    this.closeEvent.emit(true);
  }

}
