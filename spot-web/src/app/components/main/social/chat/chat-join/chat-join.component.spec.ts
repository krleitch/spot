import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatJoinComponent } from './chat-join.component';

describe('ChatJoinComponent', () => {
  let component: ChatJoinComponent;
  let fixture: ComponentFixture<ChatJoinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatJoinComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatJoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
