import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';

@Component({
  selector: 'spot-infinite-scroll',
  templateUrl: './infinite-scroll.component.html',
  styleUrls: ['./infinite-scroll.component.scss']
})
export class InfiniteScrollComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() options = {};
  @Output() scrolled = new EventEmitter();
  @ViewChild('anchor') anchor: ElementRef<HTMLElement>;

  private observer: IntersectionObserver;

  timerDelay = 2000;
  timer: any;

  constructor(private host: ElementRef) { }

  get element() {
    return this.host.nativeElement;
  }

  ngOnInit() {
    // const options = {
    //   root: this.isHostScrollable() ? this.host.nativeElement : null,
    //   ...this.options
    // };

    // this.observer = new IntersectionObserver(([entry]) => {
    //   entry.isIntersecting && this.scrolled.emit();
    // }, options);

    // this.observer.observe(this.anchor.nativeElement);
  }

  ngAfterViewInit() {

    const options = {
      root: this.isHostScrollable() ? this.host.nativeElement : null,
      ...this.options
    };

    this.observer = new IntersectionObserver(([entry]) => {

      if ( entry.isIntersecting ) {

        // start the timer

        this.scrolled.emit();

        // we look for content if the bottom is on screen every timerDelay
        this.timer = setInterval( () => {
          const bounding = this.anchor.nativeElement.getBoundingClientRect();
          if (this.inViewPort(bounding)) {
            this.scrolled.emit();
          } else {
            clearInterval(this.timer);
            this.timer = false;
          }
        }, this.timerDelay);

        } else {

        // stop the timer

        if ( this.timer ) {
          clearInterval(this.timer);
        }
        this.timer = false;

      }

    }, options);

    this.observer.observe(this.anchor.nativeElement);
  }

  ngOnDestroy() {

    if ( this.timer ) {
      clearInterval(this.timer);
    }
    this.timer = false;


    this.observer.disconnect();
  }

  private isHostScrollable() {
    const style = window.getComputedStyle(this.element);

    return style.getPropertyValue('overflow') === 'auto' ||
      style.getPropertyValue('overflow-y') === 'scroll';
  }

  inViewPort(bounding: any) {
    return (
    bounding.top >= 0 &&
    bounding.left >= 0 &&
    bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    bounding.right <= (window.innerWidth || document.documentElement.clientWidth) );
  }

}
