import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import { CollectionItemCard } from '../../components/collection-item-card/collection-item-card';
import { SearchBar } from '../../components/search-bar/search-bar';
import { CollectionService } from '../../services/collection-service';
import { Collection } from '../../models/collection';
import { CollectionItem } from '../../models/collection-item';

@Component({
  selector: 'app-collection-detail',
  imports: [CollectionItemCard, SearchBar],
  templateUrl: './collection-detail.html',
  styleUrl: './collection-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionDetail {

  collectionService = inject(CollectionService);
  count = 0;
  search = model('');

  collection!: Collection;
  coin!: CollectionItem;
  linx!: CollectionItem;
  stamp!: CollectionItem;

  selectedCollection = signal<Collection | null>(null);
  displayedItems = computed(() => {
    const allItems = this.selectedCollection()?.items || [];
    return allItems.filter((item) => item.name.toLowerCase().includes(this.search().toLowerCase()));
  });

  constructor() {
    const allCollections = this.collectionService.getAll();
    if (allCollections.length > 0) {
      this.selectedCollection.set(allCollections[0]);
    }
  }

  addGenericItem(): void {
    const collection = this.selectedCollection();
    if (collection) {
      const storedCollection = this.collectionService.addItem(collection, new CollectionItem());
      this.selectedCollection.set(storedCollection);
    }
  }
}
