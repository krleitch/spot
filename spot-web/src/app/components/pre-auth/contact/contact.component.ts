import { Component, OnInit } from '@angular/core';

// Assets
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.ABOUT;

  constructor() { }

  ngOnInit() {
  }

}
