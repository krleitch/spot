import { Component, OnInit, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  @Input() postId: string;
  comments$: Observable<Comment[]>;

  STRINGS = STRINGS.MAIN.COMMENTS;

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      comment: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  addComment() {
    const comment = this.form.value.comment;
  }

}
