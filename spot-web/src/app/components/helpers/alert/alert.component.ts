import { Component, OnInit, OnDestroy, Input } from '@angular/core';

// rxjs
import { Subscription } from 'rxjs';

// services
import { AlertService } from '@services/alert.service';

// assets
import { Alert, AlertType } from '@models/alert';

@Component({
  selector: 'spot-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit, OnDestroy {

  @Input() id: string;

  alerts: Alert[] = [];
  subscription: Subscription;

  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
    this.subscription = this.alertService.onAlert(this.id)
      .subscribe( (alert: Alert) => {
        if (!alert.message) {
          // clear alerts when an empty alert is received
          this.alerts = [];
          return;
        }
        // add alert to array
        this.alerts.push(alert);

        setTimeout(() => {
          alert.fade = true;
        }, 4000);

        setTimeout(() => {
          this.closeAlert(alert);
        }, 4500);

      });
  }

  closeAlert(alert: Alert): void {
    // remove specified alert from array
    this.alerts = this.alerts.filter(x => x !== alert);
  }

  ngOnDestroy(): void {
      this.subscription.unsubscribe();
  }

  cssClass(alert: Alert): string {

      if (!alert) {
          return;
      }

      // return css class based on alert type
      switch (alert.type) {
          case AlertType.Success:
              return 'alert alert-success';
          case AlertType.Error:
              return 'alert alert-danger';
          case AlertType.Info:
              return 'alert alert-info';
          case AlertType.Warning:
              return 'alert alert-warning';
      }
  }

}
