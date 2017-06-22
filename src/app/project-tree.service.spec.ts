import { TestBed, inject } from '@angular/core/testing';

import { ProjectTreeService } from './project-tree.service';

describe('ProjectTreeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectTreeService]
    });
  });

  it('should be created', inject([ProjectTreeService], (service: ProjectTreeService) => {
    expect(service).toBeTruthy();
  }));
});
