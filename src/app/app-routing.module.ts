import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectService } from './project.service';
import { ProjectComponent } from './project/project.component';
import { ProjectTreeComponent } from './project-tree/project-tree.component';

const routes: Routes = [
  { path: '', redirectTo: 'project', pathMatch: 'full' },
  {
    path: 'project',
    resolve: { project: ProjectService },
    component: ProjectComponent,
    children: [
      { path: '', redirectTo: 'tree', pathMatch: 'full' },
      { path: 'tree', component: ProjectTreeComponent }
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
