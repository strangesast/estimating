import { TestBed, inject, async } from '@angular/core/testing';
import { test } from './util';

import { ProjectService } from './project.service';

describe('ProjectService', () => {
  let service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectService]
    });
  });

  beforeEach(inject([ProjectService], s => {
    service = s;
  }));

  it('should be created', test(async () => {
    expect(service).toBeTruthy();
  }));
});
