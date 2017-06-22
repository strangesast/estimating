import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectService } from './project.service';
import { ProjectComponent } from './project/project.component';
import { ProjectTreeComponent } from './project-tree/project-tree.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { HistoryComponent } from './history/history.component';
import { ComponentTreeComponent } from './component-tree/component-tree.component';
import { ReportsComponent } from './reports/reports.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'project', pathMatch: 'full' },
  { path: 'user', component: UserProfileComponent },
  {
    path: 'project',
    resolve: { project: ProjectService },
    component: ProjectComponent,
    children: [
      { path: '', redirectTo: 'tree', pathMatch: 'full' },
      { path: 'tree', component: ProjectTreeComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'components', component: ComponentTreeComponent },
      { path: 'reports', component: ReportsComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    ProjectComponent
  ]
})
export class AppRoutingModule {}
