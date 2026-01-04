import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackAlert } from './feedback-alert';

describe('FeedbackAlert', () => {
  let component: FeedbackAlert;
  let fixture: ComponentFixture<FeedbackAlert>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackAlert]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackAlert);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
