import { Component, OnInit } from '@angular/core';

// Assets
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.ABOUT;

  constructor() { }

  ngOnInit() {
  }

}
