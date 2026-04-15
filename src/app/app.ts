import { Component, computed, effect, signal } from '@angular/core';
import { CollectionItemCard } from './components/collection-item-card/collection-item-card';
import { CollectionItem } from './models/collection-item';
import { SearchBar } from './components/search-bar/search-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [CollectionItemCard, SearchBar],
})
export class App {
  searchText = '';
  count = 0;
  coin!: CollectionItem;
  linx!: CollectionItem;

  itemList: CollectionItem[] = [];
  selectedItemIndex = signal(0);
  selectedItem = computed(() => {
    return this.itemList[this.selectedItemIndex()];
  });

  logEffect = effect(() =>{
    console.log(this.selectedItemIndex(), this.selectedItem());
  })

  constructor() {
    this.coin = new CollectionItem();
    this.coin.name = 'Pièce de 1972';
    this.coin.description = 'Une Pièce de 1 dollar Americain.';
    this.coin.rarity = 'Commune';
    this.coin.image = 'img/coin1.png';
    this.coin.price = 170;

    this.linx = new CollectionItem();

    this.itemList = [this.coin, this.linx];
  }

  incrementCount() {
    this.count++;
  }

  incrementIndex() {
    this.selectedItemIndex.update((currentValue) => {
      return (currentValue + 1) % this.itemList.length;
    });
  }
}
