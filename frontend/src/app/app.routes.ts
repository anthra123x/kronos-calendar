import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ScheduleComponent } from './features/schedule/schedule.component';
import { AcademicsComponent } from './features/academics/academics.component';
import { TasksComponent } from './features/tasks/tasks.component';
import { NotesComponent } from './features/notes/notes.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'academics', component: AcademicsComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'notes', component: NotesComponent },
  { path: '**', redirectTo: '' }
];
