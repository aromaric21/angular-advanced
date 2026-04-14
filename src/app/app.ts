import { Component, signal } from '@angular/core';
import { CollectionItemCard } from './components/collection-item-card/collection-item-card';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [CollectionItemCard]
})
export class App {
  protected readonly title = signal('collection-manager');
}
