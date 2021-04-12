import { Component, OnInit } from '@angular/core';

// Services
import { ModalService } from '@services/modal.service';

// Assets
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.ABOUT;

  constructor(private modalService: ModalService) { }

  ngOnInit(): void {

  }

  openTerms(): void {
    this.modalService.open('spot-terms-modal');
  }

}
