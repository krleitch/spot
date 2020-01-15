import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PostsService } from '../../services/posts.service';
import * as featureActions from './actions';

@Injectable()
export class PostsStoreEffects {
  constructor(private postsService: PostsService, private actions$: Actions) { }

  @Effect()
  dislikePostEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DislikeRequestAction>(
      featureActions.ActionTypes.DISLIKE_REQUEST
    ),
    switchMap(post =>
      this.postsService
        .dislikePost(post.request)
        .pipe(
          map(response => new featureActions.LoadRequestAction()),
          catchError(error =>
            observableOf(new featureActions.DeleteFailureAction({ error }))
          )
        )
    )
  )

  @Effect()
  likePostEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LikeRequestAction>(
      featureActions.ActionTypes.LIKE_REQUEST
    ),
    switchMap(post =>
      this.postsService
        .likePost(post.request)
        .pipe(
          map(response => new featureActions.LoadRequestAction()),
          catchError(error =>
            observableOf(new featureActions.DeleteFailureAction({ error }))
          )
        )
    )
  )

  @Effect()
  deletePostEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteRequestAction>(
      featureActions.ActionTypes.DELETE_REQUEST
    ),
    switchMap(post =>
      this.postsService
        .deletePost(post.request)
        .pipe(
          map(response => new featureActions.LoadRequestAction()),
          catchError(error =>
            observableOf(new featureActions.DeleteFailureAction({ error }))
          )
        )
    )
  )

  @Effect()
  addPostEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AddRequestAction>(
      featureActions.ActionTypes.ADD_REQUEST
    ),
    switchMap((post: featureActions.AddRequestAction) =>
      this.postsService
        .addPost(post.request)
        .pipe(
          map(response => new featureActions.LoadRequestAction()),
          catchError(error =>
            observableOf(new featureActions.AddFailureAction(error))
          )
        )
    )
  )

  @Effect()
  loadRequestEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LoadRequestAction>(
      featureActions.ActionTypes.LOAD_REQUEST
    ),
    switchMap(action =>
      this.postsService
        .getPosts()
        .pipe(
          map(
            items =>
              new featureActions.LoadSuccessAction({
                items
              })
          ),
          catchError(error =>
            observableOf(new featureActions.LoadFailureAction(error))
          )
        )
    )
  );
}
