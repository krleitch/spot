import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

// rxjs
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

// Assets
import { Alert, AlertType } from '@models/alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private subject = new Subject<Alert>();
  private keepAfterRouteChange = false;

  constructor(private router: Router) {
    // clear alert messages on route change unless 'keepAfterRouteChange' flag is true
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterRouteChange) {
          // only keep for a single route change
          this.keepAfterRouteChange = false;
        } else {
          // clear alert messages
          this.clear();
        }
      }
    });
  }

  // enable subscribing to alerts observable
  onAlert(alertId?: string): Observable<Alert> {
    return this.subject
      .asObservable()
      .pipe(filter((x) => x && x.alertId === alertId));
  }

  // convenience methods
  success(message: string, alertId?: string): void {
    this.alert(new Alert({ message, type: AlertType.Success, alertId }));
  }

  error(message: string, alertId?: string): void {
    this.alert(new Alert({ message, type: AlertType.Error, alertId }));
  }

  info(message: string, alertId?: string): void {
    this.alert(new Alert({ message, type: AlertType.Info, alertId }));
  }

  warn(message: string, alertId?: string): void {
    this.alert(new Alert({ message, type: AlertType.Warning, alertId }));
  }

  // main alert method
  alert(alert: Alert): void {
    this.keepAfterRouteChange = alert.keepAfterRouteChange;
    this.subject.next(alert);
  }

  // clear alerts
  clear(alertId?: string): void {
    this.subject.next(new Alert({ alertId }));
  }
}
