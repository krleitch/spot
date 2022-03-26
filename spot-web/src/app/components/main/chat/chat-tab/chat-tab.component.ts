import { Component, OnInit, Input } from '@angular/core';
import { ChatType, Tab } from '@models/chat';
@Component({
  selector: 'spot-chat-tab',
  templateUrl: './chat-tab.component.html',
  styleUrls: ['./chat-tab.component.scss']
})
export class ChatTabComponent implements OnInit {
  chatExpanded = true;
  @Input('tab') tab: Tab;
  @Input('close') close: (_id: string) => void;
  @Input('minimize') minimize: (_id: string) => void;

  constructor() {}

  ngOnInit(): void {}

  minimizeTab() {
    this.minimize(this.tab.id);
  }

  closeTab() {
    this.close(this.tab.id);
  }
}
