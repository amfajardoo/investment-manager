import { TestBed } from '@angular/core/testing';

import { Cdt } from './cdt';

describe('Cdt', () => {
  let service: Cdt;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cdt);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
