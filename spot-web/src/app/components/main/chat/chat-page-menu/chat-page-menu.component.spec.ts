import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatPageMenuComponent } from './chat-page-menu.component';

describe('ChatPageMenuComponent', () => {
  let component: ChatPageMenuComponent;
  let fixture: ComponentFixture<ChatPageMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatPageMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatPageMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
