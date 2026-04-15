import { Injectable } from '@angular/core';
import { Collection } from '../models/collection';
import { CollectionItem } from '../models/collection-item';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private collections: Collection[] = [];
  private currentId = 1;
  private currentItemIndex: { [key: number]: number } = {};

  constructor() {
    this.generateDummyData();
  }

  private generateDummyData() {
    const coin = new CollectionItem();
    coin.name = 'Pièce de 1972';
    coin.description = 'Pièce de 1 dollar Americain.';
    coin.rarity = 'Common';
    coin.image = 'img/coin1.png';
    coin.price = 170;

    const stamp = new CollectionItem();
    stamp.name = 'Timbre 1800';
    stamp.description = 'Un très vieux timbre.';
    stamp.rarity = 'Rarity';
    stamp.image = 'img/timbre1.png';
    stamp.price = 555;

    const linx = new CollectionItem();

    const defaultCollection = new Collection();
    defaultCollection.title = 'Collection mix';

    const storedCollection = this.add(defaultCollection);
    this.addItem(storedCollection, coin);
    this.addItem(storedCollection, linx);
    this.addItem(storedCollection, stamp);
  }

  getAll(): Collection[] {
    return this.collections.map(
      collection => collection.copy());
  }

  get(collectionId: number) {
    const storedCopy = this.collections.find(
      collection => collection.id === collectionId);
  }

  add(collection: Omit<Collection, 'id' | 'items'>): Collection {
    const storedCopy = collection.copy();
    storedCopy.id = this.currentId;
    this.collections.push(storedCopy);

    this.currentItemIndex[storedCopy.id] = 1;
    this.currentId++;

    return storedCopy.copy();
  }

  update(collection: Omit<Collection, 'items'>): Collection | null {
    const storedCopy = this.collections.find(
      collection => collection.id === collection.id);

    if (!storedCopy) return null;

    Object.assign(storedCopy, collection);
    return storedCopy.copy();
  }

  delete(collectionId: number): void {
    this.collections = this.collections.filter(
      collection => collection.id !== collectionId);
  }

  addItem(collection: Collection, item: CollectionItem): Collection | null {
    const storedCollection = this.collections.find(
      collection => collection.id === collection.id
    );

    if (!storedCollection) return null;

    const storedItem = item.copy();
    storedItem.id = this.currentItemIndex[collection.id]
    storedCollection.items.push(storedItem);

    this.currentItemIndex[collection.id]++;

    return storedCollection.copy();
  }

  updateItem(collection : Collection, item: CollectionItem){
    const storedCollection = this.collections.find(
      storedCollection => storedCollection.id === collection.id
    );

    if (!storedCollection) return null;

    const storedItemIndex = storedCollection.items.findIndex(
      storedItem => storedItem.id === item.id
    );

    if (storedItemIndex === -1) return null;

    storedCollection.items[storedItemIndex] = item.copy();
    return storedCollection.copy();
  }

  deleteItem(collectionId: number, itemId:number): Collection | null {
    const storedCollection = this.collections.find(
      storedCollection => storedCollection.id === collectionId
    );

    if (!storedCollection) return null;

    storedCollection.items = storedCollection.items.filter(
      item => item.id === item.id
    );

    return storedCollection.copy();
  }
}
