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
    this.load();
    this.generateDummyData();
  }

  private save(){
    localStorage.setItem('collections', JSON.stringify(this.collections));
  }

  private load() {
    const collectionJson = localStorage.getItem('collections');
    if (collectionJson) {
      this.collections = JSON.parse(collectionJson).map((collectionJson: any) => {
        const collection = Object.assign(new Collection(), collectionJson);
        const itemJson = collectionJson['items'] || [];
        collection.items = itemJson.map((item: any) => Object.assign(new CollectionItem(), itemJson));
        return collection;
      });
      this.currentId = Math.max(...this.collections.map(collection => collection.id ));
      this.currentItemIndex = this.collections.reduce(
        (indexes: {[key: number]:number}, collection) => {
          indexes[collection.id] = Math.max(...collection.items.map(item => item.id));
            return indexes;
        }, {}
      );
    }else {
      this.generateDummyData();
      this.save();
    }
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
    this.save();

    return storedCopy.copy();
  }

  update(collection: Omit<Collection, 'items'>): Collection | null {
    const storedCopy = this.collections.find(
      collection => collection.id === collection.id);

    if (!storedCopy) return null;

    Object.assign(storedCopy, collection);
    this.save();
    return storedCopy.copy();
  }

  delete(collectionId: number): void {
    this.collections = this.collections.filter(
      collection => collection.id !== collectionId);
  }

  addItem(collection: Collection, item: CollectionItem): Collection | null {
    const storedCollection = this.collections.find((collection) => collection.id === collection.id);

    if (!storedCollection) return null;

    const storedItem = item.copy();
    storedItem.id = this.currentItemIndex[collection.id];
    storedCollection.items.push(storedItem);

    this.currentItemIndex[collection.id]++;
    this.save();

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
    this.save();
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
    this.save();

    return storedCollection.copy();
  }
}
