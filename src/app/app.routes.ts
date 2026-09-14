import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },

  {
    path: 'overview',
    loadComponent: () =>
      import('./pages/overview/overview')
        .then(m => m.Overview)
  },

  {
    path: 'maitri',
    loadComponent: () =>
      import('./pages/maitri/maitri')
        .then(m => m.Maitri)
  },

  {
    path: 'bharati',
    loadComponent: () =>
      import('./pages/bharati/bharati')
        .then(m => m.Bharati)
  },

  {
    path: 'infrastructure',
    loadComponent: () =>
      import('./pages/infrastructure/infrastructure')
        .then(m => m.Infrastructure)
  },

  {
    path: 'energy',
    loadComponent: () =>
      import('./pages/energy/energy')
        .then(m => m.Energy)
  },

  {
    path: 'logistics',
    loadComponent: () =>
      import('./pages/logistics/logistics')
        .then(m => m.Logistics)
  },

  {
    path: 'environment',
    loadComponent: () =>
      import('./pages/environment/environment')
        .then(m => m.Environment)
  },

  {
    path: 'simulation',
    loadComponent: () =>
      import('./pages/simulation/simulation')
        .then(m => m.Simulation)
  },

  {
    path: 'alerts',
    loadComponent: () =>
      import('./pages/alerts/alerts')
        .then(m => m.Alerts)
  },

  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/reports/reports')
        .then(m => m.Reports)
  }
];