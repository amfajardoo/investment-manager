import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingButton } from './loading-button';

describe('LoadingButton', () => {
  let component: LoadingButton;
  let fixture: ComponentFixture<LoadingButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
