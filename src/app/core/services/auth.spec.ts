import { TestBed } from '@angular/core/testing';

import { Authentication } from './auth';

describe('Auth', () => {
  let service: Authentication;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Authentication);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
