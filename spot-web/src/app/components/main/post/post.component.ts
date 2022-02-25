import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';

// Rxjs
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { take } from 'rxjs/operators';

// Services
import { ModalService } from '@services/modal.service';
import { AuthenticationService } from '@services/authentication.service';

// Store
import { Store, select } from '@ngrx/store';
import { UserStoreSelectors } from '@src/app/root-store/user-store';
import { RootStoreState } from '@store';
import { SpotStoreActions } from '@src/app/root-store/spot-store';

// Assets
import { SPOT_CONSTANTS } from '@constants/spot';
import { LOCATION_CONSTANTS } from '@constants/location';
import {
  DeleteSpotRequest,
  RateSpotRequest,
  Spot,
  DeleteRatingRequest,
  SpotRatingType
} from '@models/../newModels/spot';
import { User, UserRole } from '@models/../newModels/user';
import { UserMetadata, UnitSystem } from '@models/../newModels/userMetadata';
import { LocationData } from '@models/../newModels/location';
import {
  ModalImageData,
  ModalOptions,
  ModalConfirmResult,
  ModalConfirmResultTypes
} from '@models/modal';

@Component({
  selector: 'spot-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  @Input() detailed: boolean;
  @Input() spot: Spot;
  @ViewChild('options') options: ElementRef;
  @ViewChild('spotimage') spotImage: ElementRef;

  SPOT_CONSTANTS = SPOT_CONSTANTS;

  location$: Observable<LocationData>;
  location: LocationData;
  user$: Observable<User>;
  user: User;
  userMetadata$: Observable<UserMetadata>;
  userMetadata: UserMetadata;

  time: string;
  imageBlurred: boolean; // if content flagged nsfw
  expanded = false;
  isExpandable = false;

  eSpotRatingType = SpotRatingType;
  eUserRole = UserRole;
  optionsEnabled = false;

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private modalService: ModalService,
    private authenticationService: AuthenticationService
  ) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit(): void {
    // User
    this.user$ = this.store$.pipe(select(UserStoreSelectors.selectUser));

    this.user$.pipe(takeUntil(this.onDestroy)).subscribe((user: User) => {
      this.user = user;
    });

    this.userMetadata$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserMetadata)
    );

    this.userMetadata$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((userMetadata: UserMetadata) => {
        this.userMetadata = userMetadata;
      });

    // Location
    this.location$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocation)
    );

    this.location$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((location: LocationData) => {
        this.location = location;
      });

    // Check if content needs to be truncated
    if (
      this.spot.content.split(/\r\n|\r|\n/).length >
        SPOT_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH ||
      this.spot.content.length > SPOT_CONSTANTS.MAX_TRUNCATE_LENGTH
    ) {
      this.isExpandable = true;
    }

    this.time = this.getTime();
    this.imageBlurred = this.spot.imageNsfw;
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  offClickHandler(event: MouseEvent): void {
    if (this.options && !this.options.nativeElement.contains(event.target)) {
      this.setOptions(false);
    }
  }

  setOptions(value): void {
    this.optionsEnabled = value;
  }

  openSpot(): void {
    this.router.navigateByUrl('spot/' + this.spot.link);
  }

  deleteSpot(): void {
    this.modalService
      .open('global', 'confirm')
      .pipe(take(1))
      .subscribe((result: ModalConfirmResult) => {
        if (result.status === ModalConfirmResultTypes.CONFIRM) {
          const request: DeleteSpotRequest = {
            spotId: this.spot.spotId
          };
          this.store$.dispatch(
            new SpotStoreActions.DeleteRequestAction(request)
          );
          // go home
          if (this.detailed) {
            this.router.navigateByUrl('/home');
          }
        }
      });
  }

  getTime(): string {
    const curTime = new Date();
    // Need to convert from UTC  date to current time
    const spotTime = new Date(this.spot.createdAt);
    const timeDiff = curTime.getTime() - spotTime.getTime();
    if (timeDiff < 60000) {
      const secDiff = Math.round(timeDiff / 1000);
      if (secDiff <= 0) {
        return 'Now';
      } else {
        return secDiff + 's';
      }
    } else if (timeDiff < 3600000) {
      const minDiff = Math.round(timeDiff / 60000);
      return minDiff + 'm';
    } else if (timeDiff < 86400000) {
      const hourDiff = Math.round(timeDiff / 3600000);
      return hourDiff + 'h';
    } else if (timeDiff < 31536000000) {
      const dayDiff = Math.round(timeDiff / 86400000);
      return dayDiff + 'd';
    } else {
      const yearDiff = Math.round(timeDiff / 31536000000);
      return yearDiff + 'y';
    }
  }

  getDistance(distance: number): string {
    let unit;
    if (this.userMetadata) {
      unit = this.userMetadata.unitSystem;
    } else {
      unit = UnitSystem.IMPERIAL;
    }

    let distanceString = '';

    if (distance <= LOCATION_CONSTANTS.MIN_DISTANCE) {
      distanceString += '< ';
    }

    if (unit === UnitSystem.METRIC) {
      distanceString += (distance * 1.60934).toFixed(1) + ' km';
    } else {
      distanceString += distance.toFixed(1) + ' m';
    }

    return distanceString;
  }

  getContent(): string {
    if (this.expanded || !this.isExpandable) {
      return this.spot.content;
    }

    const textArrays = this.spot.content.split(/\r\n|\r|\n/);
    let truncatedContent = '';

    for (
      let i = 0;
      i < textArrays.length && i < SPOT_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH;
      i++
    ) {
      if (
        truncatedContent.length + textArrays[i].length >
        SPOT_CONSTANTS.MAX_TRUNCATE_LENGTH
      ) {
        truncatedContent = textArrays[i].substring(
          0,
          SPOT_CONSTANTS.MAX_TRUNCATE_LENGTH - truncatedContent.length
        );
        break;
      } else {
        truncatedContent += textArrays[i];
        // Dont add newline for last line or last line before line length reached
        if (
          i !== textArrays.length - 1 &&
          i !== SPOT_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH - 1
        ) {
          truncatedContent += '\n';
        }
      }
    }

    return truncatedContent + ' ...';
  }

  like(): void {
    if (!this.authenticationService.isAuthenticated()) {
      this.modalService.open('global', 'auth');
      return;
    }

    if (this.spot.myRating === SpotRatingType.LIKE) {
      const request: DeleteRatingRequest = {
        spotId: this.spot.spotId
      };
      this.store$.dispatch(
        new SpotStoreActions.DeleteRatingRequestAction(request)
      );
      if (this.detailed) {
        this.spot.likes -= 1;
        this.spot.myRating = SpotRatingType.NONE;
      }
    } else {
      const request: RateSpotRequest = {
        spotId: this.spot.spotId,
        rating: SpotRatingType.LIKE
      };
      this.store$.dispatch(new SpotStoreActions.RateRequestAction(request));
      if (this.detailed) {
        this.spot.likes += 1;
        this.spot.myRating = SpotRatingType.LIKE;
      }
    }
  }

  dislike(): void {
    if (!this.authenticationService.isAuthenticated()) {
      this.modalService.open('global', 'auth');
      return;
    }

    if (this.spot.myRating === SpotRatingType.DISLIKE) {
      const request: DeleteRatingRequest = {
        spotId: this.spot.spotId
      };
      this.store$.dispatch(
        new SpotStoreActions.DeleteRatingRequestAction(request)
      );
      if (this.detailed) {
        this.spot.dislikes -= 1;
        this.spot.myRating = SpotRatingType.NONE;
      }
    } else {
      const request: RateSpotRequest = {
        spotId: this.spot.spotId,
        rating: SpotRatingType.DISLIKE
      };
      this.store$.dispatch(new SpotStoreActions.RateRequestAction(request));
      if (this.detailed) {
        this.spot.dislikes += 1;
        this.spot.myRating = SpotRatingType.DISLIKE;
      }
    }
  }

  setExpanded(value: boolean): void {
    this.expanded = value;
  }

  closeModal(id: string): void {
    this.modalService.close(id);
  }

  openReportModal(spotId: string): void {
    if (!this.authenticationService.isAuthenticated()) {
      this.modalService.open('global', 'auth');
      return;
    }

    this.modalService.open('global', 'report', { spotId: spotId });
  }

  openShareModal(spotId: string, spotLink: string) {
    this.modalService.open('global', 'share', {
      spotId: spotId,
      spotLink: spotLink
    });
  }

  imageClicked(): void {
    if (!this.imageBlurred) {
      const modalData: ModalImageData = { imageSrc: this.spot.imageSrc };
      const modalOptions: ModalOptions = { width: 'auto' };
      this.modalService.open('global', 'image', modalData, modalOptions);
    } else {
      this.imageBlurred = false;
    }
  }
}
