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
import { TreeDirective } from './tree.directive';
import { HistoryComponent } from './history/history.component';
import { ProjectSettingsComponent } from './project-settings/project-settings.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    ProjectComponent,
    SettingsComponent,
    UserProfileComponent,
    ReportsComponent,
    ProjectTreeComponent,
    ComponentTreeComponent,
    TreeDirective,
    HistoryComponent,
    ProjectSettingsComponent
  ],
  providers: [ProjectService, Store],
  bootstrap: [AppComponent]
})
export class AppModule { }
