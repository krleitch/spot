import { Component, OnInit, Input } from '@angular/core';
import { Notification } from '@models/notifications';
import { Router } from '@angular/router';

@Component({
  selector: 'spot-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit {

  @Input() notification: Notification;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToPost() {
    this.router.navigateByUrl(/posts/ + this.notification.post_id);
  }

}
