import { Component, OnInit, Input } from '@angular/core';
import { ChatType, ChatTab } from '@models/chat';
@Component({
  selector: 'spot-chat-tab',
  templateUrl: './chat-tab.component.html',
  styleUrls: ['./chat-tab.component.scss']
})
export class ChatTabComponent implements OnInit {
  chatExpanded = true;
  @Input() tab: ChatTab;
  @Input() close: (_id: string) => void;
  @Input() minimize: (_id: string) => void;

  constructor() {}

  ngOnInit(): void {}

  getMinimizedName(name: string) {
    if (name) {
      return name.substring(0, 1).toUpperCase();
    }
  }

  minimizeTab() {
    this.minimize(this.tab.tabId);
  }

  closeTab() {
    this.close(this.tab.tabId);
  }
}
