import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMenuRoomComponent } from './chat-menu-room.component';

describe('ChatMenuRoomComponent', () => {
  let component: ChatMenuRoomComponent;
  let fixture: ComponentFixture<ChatMenuRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatMenuRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatMenuRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
