import { TestBed } from '@angular/core/testing';

import { Fpv } from './fpv';

describe('Fpv', () => {
  let service: Fpv;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fpv);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
