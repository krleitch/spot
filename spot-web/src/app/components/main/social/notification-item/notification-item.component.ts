import { Component, OnInit, Input } from '@angular/core';
import { Notification } from '@models/notifications';
import { Router } from '@angular/router';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit {

  @Input() notification: Notification;

  STRINGS = STRINGS.MAIN.NOTIFICATION_ITEM;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  formatDate(date: string) {
    const time = new Date(date);
    return time.toDateString();
  }

  goToPost() {
    this.router.navigateByUrl(/posts/ + this.notification.post_id);
  }

}
