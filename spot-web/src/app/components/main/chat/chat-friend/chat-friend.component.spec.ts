import { provideMockStore } from '@ngrx/store/testing';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatFriendComponent } from './chat-friend.component';

const initialState = {};

describe('ChatFriendComponent', () => {
  let component: ChatFriendComponent;
  let fixture: ComponentFixture<ChatFriendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatFriendComponent],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatFriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
