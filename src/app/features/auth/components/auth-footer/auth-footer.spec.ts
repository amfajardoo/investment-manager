import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFooter } from './auth-footer';

describe('AuthFooter', () => {
  let component: AuthFooter;
  let fixture: ComponentFixture<AuthFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthFooter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
