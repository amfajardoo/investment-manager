import type { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/login/login'),
  },
  {
    path: 'register',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/register/register'),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard'),
  },
  // {
  //   path: 'cdts',
  //   canActivate: [authGuard],
  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () => import('./features/cdts/cdt-list/cdt-list.component')
  //         .then(m => m.CdtListComponent)
  //     },
  //     {
  //       path: 'new',
  //       loadComponent: () => import('./features/cdts/cdt-form/cdt-form.component')
  //         .then(m => m.CdtFormComponent)
  //     },
  //     {
  //       path: 'edit/:id',
  //       loadComponent: () => import('./features/cdts/cdt-form/cdt-form.component')
  //         .then(m => m.CdtFormComponent)
  //     }
  //   ]
  // },
  // {
  //   path: 'fpv',
  //   canActivate: [authGuard],
  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () => import('./features/fpv/fpv-list/fpv-list.component')
  //         .then(m => m.FpvListComponent)
  //     },
  //     {
  //       path: 'new',
  //       loadComponent: () => import('./features/fpv/fpv-form/fpv-form.component')
  //         .then(m => m.FpvFormComponent)
  //     }
  //   ]
  // },
  // {
  //   path: 'simulator',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./features/simulator/simulator.component')
  //     .then(m => m.SimulatorComponent)
  // },
  {
    path: '**',
    redirectTo: '/login',
  },
];
