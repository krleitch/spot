import { Component, OnInit, Input } from '@angular/core';

// services
import { ModalService } from '@services/modal.service';

// assets
import { STRINGS } from '@assets/strings/en';
@Component({
  selector: 'spot-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  @Input() modalId: string;

  STRINGS = STRINGS.MAIN.WELCOME;

  constructor(private modalService: ModalService) { }

  ngOnInit(): void {
  }

  closeWelcome(): void {
    this.modalService.close(this.modalId);
  }

}
