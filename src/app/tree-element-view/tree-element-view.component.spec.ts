import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeElementViewComponent } from './tree-element-view.component';

describe('TreeElementViewComponent', () => {
  let component: TreeElementViewComponent;
  let fixture: ComponentFixture<TreeElementViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeElementViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeElementViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
