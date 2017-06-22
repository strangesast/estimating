import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryChooserComponent } from './history-chooser.component';

describe('HistoryChooserComponent', () => {
  let component: HistoryChooserComponent;
  let fixture: ComponentFixture<HistoryChooserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryChooserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
