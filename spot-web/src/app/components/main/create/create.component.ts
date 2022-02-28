import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Observable, Subject } from 'rxjs';
import { skip, takeUntil, take } from 'rxjs/operators';

// Services
import { TranslateService } from '@ngx-translate/core';
import { SpotService } from '@services/spot.service';

// Store
import { Store, select } from '@ngrx/store';
import { UserStoreSelectors } from '@src/app/root-store/user-store';
import { RootStoreState } from '@store';
import {
  SpotStoreActions,
  SpotStoreSelectors
} from '@src/app/root-store/spot-store';

// Models
import {
  CreateSpotRequest,
  CreateSpotResponse,
  AddSpotStoreRequest
} from '@models/../newModels/spot';
import { LocationData } from '@models/../newModels/location';
import { SpotError } from '@exceptions/error';

// Assets
import { SPOT_CONSTANTS } from '@constants/spot';

@Component({
  selector: 'spot-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  @ViewChild('create') create: ElementRef;

  STRINGS;
  SPOT_CONSTANTS = SPOT_CONSTANTS;

  // Location
  location$: Observable<LocationData>;
  location: LocationData;

  // Content
  currentLength = 0;

  // Images
  imageFile: File;
  imgSrc: string = null;

  // Create
  createSuccess$: Observable<boolean>;
  createLoading = false;
  createError$: Observable<SpotError>;
  createError: string;

  constructor(
    private store$: Store<RootStoreState.State>,
    public domSanitizer: DomSanitizer,
    private translateService: TranslateService,
    private spotService: SpotService
  ) {
    this.translateService.get('MAIN.CREATE').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    // Location
    this.location$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocation)
    );

    this.location$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((location: LocationData) => {
        this.location = location;
      });
  }

  ngAfterViewInit(): void {
    this.create.nativeElement.addEventListener('paste', (event: any) => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  onTextInput(event): void {
    // remove <br> if empty
    if (event.target.textContent.length === 0) {
      this.create.nativeElement.innerHTML = '';
    }
    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = Math.max(
      0,
      event.target.textContent.length + event.target.childNodes.length - 1
    );
    // Reset the error when you start typing
    this.createError = '';
  }

  invalidLength(): boolean {
    return this.currentLength > SPOT_CONSTANTS.MAX_CONTENT_LENGTH;
  }

  submit(): void {
    let content = this.create.nativeElement.innerHTML;

    // parse the innerhtml to return a string with newlines instead of innerhtml
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(content, 'text/html');

    const body = parsedHtml.getElementsByTagName('body');
    const bodyChildren = body[0].children;

    let text;
    if (body[0].childNodes.length > 0) {
      text = body[0].childNodes[0].nodeValue || '';

      for (let i = 0; i < bodyChildren.length; i++) {
        if (i === 0) {
          text += '\n';
        }
        text += bodyChildren[i].textContent;
        if (i !== bodyChildren.length - 1) {
          text += '\n';
        }
      }
    } else {
      text = body[0].textContent;
    }

    // trim whitespace at beginning and end
    content = text.trim();

    if (content.split(/\r\n|\r|\n/).length > SPOT_CONSTANTS.MAX_LINE_LENGTH) {
      this.createError = this.STRINGS.ERROR_LINE_LENGTH.replace(
        '%LENGTH%',
        SPOT_CONSTANTS.MAX_LINE_LENGTH.toString()
      );
      return;
    }

    if (content.length === 0 && !this.imageFile) {
      this.createError = this.STRINGS.ERROR_NO_CONTENT;
      return;
    }

    if (content.length < SPOT_CONSTANTS.MIN_CONTENT_LENGTH) {
      this.createError = this.STRINGS.ERROR_MIN_CONTENT.replace(
        '%MIN%',
        SPOT_CONSTANTS.MIN_CONTENT_LENGTH.toString()
      );
      return;
    }

    if (content.length > SPOT_CONSTANTS.MAX_CONTENT_LENGTH) {
      this.createError = this.STRINGS.ERROR_MAX_CONTENT.replace(
        '%MAX%',
        SPOT_CONSTANTS.MAX_CONTENT_LENGTH.toString()
      );
      return;
    }

    // Only allow ascii characters currently, so check anything but ascii
    // So user knows what they need to change
    // eslint-disable-next-line no-control-regex
    const regex = /^[^\x00-\x7F]*$/;
    const match = content.match(regex);
    if (match && match[0].length > 0) {
      this.createError = this.STRINGS.ERROR_INVALID_CONTENT + match[0];
      return;
    }

    // Send the request
    if (this.location != null) {
      const post: CreateSpotRequest = {
        content,
        location: this.location,
        image: this.imageFile
      };

      this.createLoading = true;
      this.spotService
        .createSpot(post)
        .pipe(take(1))
        .subscribe(
          (response: CreateSpotResponse) => {
            const addRequest: AddSpotStoreRequest = {
              spot: response.spot
            };
            this.store$.dispatch(
              new SpotStoreActions.AddSpotStoreAction(addRequest)
            );
            this.createLoading = false;
            this.removeFile();
            this.create.nativeElement.innerText = '';
            this.create.nativeElement.innerHTML = '';
            Array.from(this.create.nativeElement.children).forEach(
              (c: HTMLElement) => (c.innerHTML = '')
            );
            this.create.nativeElement.innerHTML = '';
            this.currentLength = 0;
          },
          (createError: SpotError) => {
            this.createLoading = false;
            if (createError) {
              if (createError.name === 'InvalidPostProfanity') {
                this.createError = this.STRINGS.ERROR_PROFANITY.replace(
                  '%PROFANITY%',
                  createError.body.word
                );
              } else {
                this.createError = createError.message;
              }
            }
          }
        );
    } else {
      this.createError = this.STRINGS.ERROR_LOCATION;
      return;
    }
  }

  onFileChanged(event): void {
    this.imageFile = event.target.files[0];
    this.imgSrc = window.URL.createObjectURL(this.imageFile);
    this.createError = '';
  }

  removeFile(): void {
    this.imageFile = null;
    this.imgSrc = null;
    this.createError = '';
  }
}
