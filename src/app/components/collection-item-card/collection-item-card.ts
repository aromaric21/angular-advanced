import { Component, input } from '@angular/core';

@Component({
  selector: 'app-collection-item-card',
  imports: [],
  templateUrl: './collection-item-card.html',
  styleUrl: './collection-item-card.scss',
})
export class CollectionItemCard {
  name = input('My figurine');
  rarity = input("Legendary");
  description = input('A legendary sword of unmatched sharpness and history.');
  price = input(199);
}
