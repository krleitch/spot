import { Component, OnInit } from '@angular/core';

// Services
import { ModalService } from '@services/modal.service';

// Assets
import { ModalImageData } from '@models/modal';

@Component({
  selector: 'spot-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {

  // MODAL
  modalId;
  data: ModalImageData = { imageSrc: null };

  constructor(private modalService: ModalService) {}

  ngOnInit() {}
}
