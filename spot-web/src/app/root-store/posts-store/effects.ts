import { Injectable } from '@angular/core';


// rxjs
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// services
import { PostsService } from '@services/posts.service';

// store
import { Action } from '@ngrx/store';
import * as featureActions from './actions';
import { Actions, Effect, ofType } from '@ngrx/effects';

// Assets
import { DislikePostSuccess, LikePostSuccess, DeletePostSuccess, LoadPostSuccess, AddPostSuccess, UnratedPostSuccess } from '@models/posts';

@Injectable()
export class PostsStoreEffects {
  constructor(private postsService: PostsService, private actions$: Actions) { }

  @Effect({dispatch: false})
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.GenericFailureAction>(
      featureActions.ActionTypes.GENERIC_FAILURE
    ),
    tap((action: featureActions.GenericFailureAction) => {
      if ( action.error.name === 'LocationError ') {
        this.postsService.failureMessage('You are using an invalid location');
      } else {
        this.postsService.failureMessage('Oops... Somethings went wrong');
      }
    })
  );

  @Effect()
  dislikePostEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DislikeRequestAction>(
      featureActions.ActionTypes.DISLIKE_REQUEST
    ),
    switchMap(action =>
      this.postsService
        .dislikePost(action.request)
        .pipe(
          map( (response: DislikePostSuccess) => new featureActions.DislikeSuccessAction(response)),
          catchError( errorResponse =>
            observableOf(new featureActions.GenericFailureAction(errorResponse.error))
          )
        )
    )
  );

  @Effect()
  likePostEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LikeRequestAction>(
      featureActions.ActionTypes.LIKE_REQUEST
    ),
    switchMap(action =>
      this.postsService
        .likePost(action.request)
        .pipe(
          map( (response: LikePostSuccess) => new featureActions.LikeSuccessAction(response)),
          catchError(errorResponse =>
            observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  unratedPostEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.UnratedRequestAction>(
      featureActions.ActionTypes.UNRATED_REQUEST
    ),
    switchMap(action =>
      this.postsService
        .unratedPost(action.request)
        .pipe(
          map( (response: UnratedPostSuccess) => new featureActions.UnratedSuccessAction(response)),
          catchError(errorResponse =>
            observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  deletePostEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteRequestAction>(
      featureActions.ActionTypes.DELETE_REQUEST
    ),
    switchMap(action =>
      this.postsService
        .deletePost(action.request)
        .pipe(
          map( (response: DeletePostSuccess) => new featureActions.DeleteSuccessAction(response)),
          catchError(errorResponse =>
            observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  addPostEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AddRequestAction>(
      featureActions.ActionTypes.ADD_REQUEST
    ),
    switchMap((post: featureActions.AddRequestAction) =>
      this.postsService
        .addPost(post.request)
        .pipe(
          map( (response: AddPostSuccess) => new featureActions.AddSuccessAction( response )),
          catchError(errorResponse =>
            observableOf(new featureActions.AddFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  loadRequestEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LoadRequestAction>(
      featureActions.ActionTypes.LOAD_REQUEST
    ),
    switchMap(action =>
      this.postsService
        .getPosts(action.request)
        .pipe(
          map((response: LoadPostSuccess) => {
            response.initialLoad = action.request.initialLoad;
            return new featureActions.LoadSuccessAction( response );
          }),
          catchError(errorResponse => {
            return observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
          })
        )
    )
  );

}
