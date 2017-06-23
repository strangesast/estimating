import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeElementComponent } from './tree-element.component';

describe('TreeElementComponent', () => {
  let component: TreeElementComponent;
  let fixture: ComponentFixture<TreeElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
