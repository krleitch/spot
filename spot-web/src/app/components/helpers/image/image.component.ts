import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { ModalService } from '@services/modal.service';

@Component({
  selector: 'spot-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {

  @Input() modalId;

  data$: Observable<any>;
  data: { imageSrc: string } = { imageSrc: null };

  constructor(private modalService: ModalService) { }

  ngOnInit() {

    this.data$ = this.modalService.getData(this.modalId);

    this.data$.subscribe( (val) => {
      this.data.imageSrc = val;
    });


  }

}
