import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
export const routes: Routes = [

  /* =========================
     HOME
     ========================= */

  {
    path: '',
    loadComponent: () =>
      import('./home/home')
        .then(m => m.Home)
  },


  /* =========================
     AUTH
     ========================= */

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login')
        .then(m => m.Login)
  },
    {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup')
        .then(m => m.Signup)
  },




  /* =========================
     PROTECTED DASHBOARD
     ========================= */

  {
    path: 'overview',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/overview/overview')
        .then(m => m.Overview)
  },

  {
    path: 'maitri',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/maitri/maitri')
        .then(m => m.Maitri)
  },

  {
    path: 'bharati',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/bharati/bharati')
        .then(m => m.Bharati)
  },

  {
    path: 'infrastructure',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/infrastructure/infrastructure')
        .then(m => m.Infrastructure)
  },

  {
    path: 'energy',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/energy/energy')
        .then(m => m.Energy)
  },

  {
    path: 'logistics',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/logistics/logistics')
        .then(m => m.Logistics)
  },

  {
    path: 'environment',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/environment/environment')
        .then(m => m.Environment)
  },

  {
    path: 'simulation',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/simulation/simulation')
        .then(m => m.Simulation)
  },

  {
    path: 'alerts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/alerts/alerts')
        .then(m => m.Alerts)
  },

  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/reports/reports')
        .then(m => m.Reports)
  },


  /* =========================
     FALLBACK
     ========================= */

  {
    path: '**',
    redirectTo: ''
  }

];