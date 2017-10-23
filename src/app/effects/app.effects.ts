import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';

@Injectable()
export class MainEffects {
  constructor(private action$: Actions) {}
}
