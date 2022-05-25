import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatPasswordComponent } from './chat-password.component';

describe('ChatPasswordComponent', () => {
  let component: ChatPasswordComponent;
  let fixture: ComponentFixture<ChatPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatPasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
