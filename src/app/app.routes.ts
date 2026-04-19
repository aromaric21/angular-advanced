import { Routes } from '@angular/router';
import { CollectionDetail } from './pages/collection-detail/collection-detail';
import { CollectionItemDetail } from './pages/collection-item-detail/collection-item-detail';
import { NotFound } from './pages/not-found/not-found';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: CollectionDetail },
  { path: 'item',
    children: [
      {path: '',  component: CollectionItemDetail},
      {path: ':id', component: CollectionItemDetail},
    ]
  },
  {path: 'login', component: Login},
  { path: '**', component: NotFound },
];
