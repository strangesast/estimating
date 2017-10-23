import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { ProjectService } from './project.service';

import { AppComponent } from './app.component';
import { ProjectComponent } from './project/project.component';
import { SettingsComponent } from './settings/settings.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ReportsComponent } from './reports/reports.component';
import { ProjectTreeComponent } from './project-tree/project-tree.component';
import { ComponentTreeComponent } from './component-tree/component-tree.component';
import { Store } from './store';
import { HistoryComponent } from './history/history.component';
import { ProjectSettingsComponent } from './project-settings/project-settings.component';
import { ObjToTypePipe } from './obj-to-type.pipe';
import { HistoryChooserComponent } from './history-chooser/history-chooser.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TreeOf } from './tree.directive';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { reducers } from './reducers';
import { MainEffects } from './effects';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers, {
      initialState: {}
    }),
    EffectsModule.forRoot([
      MainEffects
    ])
  ],
  declarations: [
    AppComponent,
    ProjectComponent,
    SettingsComponent,
    UserProfileComponent,
    ReportsComponent,
    ProjectTreeComponent,
    ComponentTreeComponent,
    HistoryComponent,
    ProjectSettingsComponent,
    ObjToTypePipe,
    HistoryChooserComponent,
    DashboardComponent,
    TreeOf
  ],
  providers: [ProjectService, Store],
  bootstrap: [AppComponent],
  entryComponents: []
})
export class AppModule { }
