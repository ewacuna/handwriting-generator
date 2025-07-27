import { Routes } from '@angular/router';
import { Generator } from './features/generator/generator';

export const routes: Routes = [
  {
    path: '',
    component: Generator,
    pathMatch: 'full',
  },
];
