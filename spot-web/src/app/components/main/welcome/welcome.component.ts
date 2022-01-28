import { Component, Input, OnInit } from '@angular/core';

// services
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'spot-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  @Input() modalId: string;
  constructor(private modalService: ModalService) {}

  ngOnInit(): void {}

  closeWelcome(): void {
    this.modalService.close(this.modalId);
  }
}
