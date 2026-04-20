import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { CollectionItemCard } from '../../components/collection-item-card/collection-item-card';
import { SearchBar } from '../../components/search-bar/search-bar';
import { CollectionService } from '../../services/collection/collection-service';
import { Collection } from '../../models/collection';
import { CollectionItem } from '../../models/collection-item';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-collection-detail',
  imports: [CollectionItemCard, SearchBar, MatButtonModule],
  templateUrl: './collection-detail.html',
  styleUrl: './collection-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionDetail {

  private readonly router = inject(Router);
  private readonly collectionService = inject(CollectionService);

  search = model('');
  collectionId = input<number | undefined, string | undefined>(undefined, {
    alias: 'id',
    transform: ((id: string | undefined) => id ? parseInt(id): undefined)
  });

  selectedCollection$ = toObservable(this.collectionId).pipe(
    takeUntilDestroyed(),
    filter(id => id !== undefined),
    switchMap(id => this.collectionService.get(id)),
    tap(collection => {
      this.selectedCollection.set(collection);
    })
  )

  selectedCollection = signal<Collection>(new Collection());

  displayedItems = computed(() => {
    const allItems = this.selectedCollection()?.items || [];
    return allItems.filter(item =>
      item.name.toLowerCase().includes(
        (this.search() || '').toLowerCase()
    )
  );
  });

  constructor() {
    effect(() => {
      if (!this.collectionId() && this.collectionService.selectedCollection()){
        this.router.navigate(['collection', this.collectionService.selectedCollection()?.id])
      }
    })
    this.selectedCollection$.subscribe()
  }

  addItem(): void {
    this.router.navigate(['item']);
  }

  openItem(item: CollectionItem): void {
    this.router.navigate(['item', item.id]);
  }
}
