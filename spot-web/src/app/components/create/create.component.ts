import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PostsStoreActions, PostsStoreSelectors, RootStoreState } from '../../root-store';

@Component({
  selector: 'spot-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  form: FormGroup;

  expanded: boolean = false;

  constructor(private fb: FormBuilder, private store$: Store<RootStoreState.State>) { 
    
    this.form = this.fb.group({
      content: ['', Validators.required],
      spot: ['', Validators.required]
  });

  }

  ngOnInit() {}

  expand() {
    this.expanded = !this.expanded;
  }

  addPost(event) {
    if (event.content) {
      var post: any = {
        Content: event.content,
        Spot: "Waterloo"
      };
      this.store$.dispatch(
        new PostsStoreActions.AddRequestAction(post)
      )
    }
  }


}
