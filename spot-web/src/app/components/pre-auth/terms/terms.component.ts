import { Component, OnInit } from '@angular/core';

// Assets
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.TERMS;

  constructor() { }

  ngOnInit(): void {

  }

}
