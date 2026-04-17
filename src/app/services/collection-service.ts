import { Injectable } from '@angular/core';
import { Collection } from '../models/collection';
import { CollectionItem, Rarities } from '../models/collection-item';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private collections: Collection[] = [];
  private currentId = 1;
  private currentItemIndex: { [key: number]: number } = {};

  constructor() {
    this.load();
    //this.generateDummyData();
  }

  private save(){
    localStorage.setItem('collection', JSON.stringify(this.collections));
  }

  private load() {
    const collectionJson = localStorage.getItem('collections');
    if (collectionJson) {
      const parsed = JSON.parse(collectionJson);

      this.collections = parsed.map((col: any) => {
        // Reconstruire l'objet Collection
        const collection = Object.assign(new Collection(), col);

        // Reconstruire les items de la collection
        const itemsJson = col.items || [];
        collection.items = itemsJson.map((item: any) =>
          Object.assign(new CollectionItem(), item)
        );

        return collection;
      });

      // Calculer l'ID courant pour les collections
      this.currentId = this.collections.length > 0
        ? Math.max(...this.collections.map(c => c.id)) + 1
        : 1;

      // Calculer l'index courant des items par collection
      this.currentItemIndex = this.collections.reduce(
        (indexes: { [key: number]: number }, collection) => {
          indexes[collection.id] = collection.items.length > 0
            ? Math.max(...collection.items.map(item => item.id)) + 1
            : 1;
          return indexes;
        },
        {}
      );
    } else {
      // Si rien n'est stocké, générer des données par défaut
      this.generateDummyData();
      this.save();
    }
  }

  private generateDummyData() {
    const coin = new CollectionItem();
    coin.name = 'Pièce de 1972';
    coin.description = 'Pièce de 1 dollar Americain.';
    coin.rarity = Rarities.Common;
    coin.image = 'img/coin1.png';
    coin.price = 170;

    const stamp = new CollectionItem();
    stamp.name = 'Timbre 1800';
    stamp.description = 'Un très vieux timbre.';
    stamp.rarity = Rarities.Uncommon;
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
    this.save();
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
