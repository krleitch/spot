import { Component, OnInit, Input } from '@angular/core';

import { STRINGS } from '@assets/strings/en';
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'spot-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  @Input() modalId: string;

  STRINGS = STRINGS.MAIN.WELCOME;

  constructor(private modalService: ModalService) { }

  ngOnInit() {
  }

  closeWelcome() {
    this.modalService.close(this.modalId);
  }

}
