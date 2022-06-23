import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMenuFriendComponent } from './chat-menu-friend.component';

describe('ChatMenuFriendComponent', () => {
  let component: ChatMenuFriendComponent;
  let fixture: ComponentFixture<ChatMenuFriendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatMenuFriendComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatMenuFriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
