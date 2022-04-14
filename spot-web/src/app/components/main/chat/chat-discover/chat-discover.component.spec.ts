import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDiscoverComponent } from './chat-discover.component';

describe('ChatDiscoverComponent', () => {
  let component: ChatDiscoverComponent;
  let fixture: ComponentFixture<ChatDiscoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatDiscoverComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatDiscoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
