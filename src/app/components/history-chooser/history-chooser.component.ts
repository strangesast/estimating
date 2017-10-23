import { Input, OnChanges, Output, EventEmitter, Component, OnInit, SimpleChanges } from '@angular/core';

interface HistoryState {
  index: number;
  description: string;
  changes?: any[];
  diff?: any;
}

@Component({
  selector: 'app-history-chooser',
  templateUrl: './history-chooser.component.html',
  styleUrls: ['./history-chooser.component.less']
})
export class HistoryChooserComponent implements OnInit {
  @Input('max') displayMax: number = 5;
  @Input('history') history: HistoryState[];
  visibleHistory = [];

  private _index: number = -1;
  @Input('index') get historyIndex() {
    return this._index;
  }
  @Output('indexChange') historyIndexChange = new EventEmitter();
  set historyIndex(val) {
    this._index = val;
    this.historyIndexChange.emit(val);
  }

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes) {
    if ('history' in changes) {
      this.setVisibleHistory(changes['history'].currentValue, this.historyIndex);
    }
  }

  setHistoryIndex(index): void {
    let l = this.history.length;
    this.historyIndex = index < l ? (index > 0 ? index : 0) : l - 1;
    this.setVisibleHistory(this.history, this.historyIndex);
  }

  setVisibleHistory(arr, i) {
    let l = arr.length;
    let max = this.displayMax;
    let start = Math.min(Math.max(i - Math.floor(max/2), 0), l - max);
    let end = start + max;
    this.visibleHistory = arr.slice(start, end);
  }
}
