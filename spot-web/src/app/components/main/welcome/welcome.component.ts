import { Component, Input, OnInit } from '@angular/core';

// services
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'spot-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  // MODAL
  modalId: string;
  data; // unused

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {}

  closeWelcome(): void {
    this.modalService.close(this.modalId);
  }
}
