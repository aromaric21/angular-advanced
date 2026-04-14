import { Component } from '@angular/core';

@Component({
  selector: 'app-collection-item-card',
  imports: [],
  templateUrl: './collection-item-card.html',
  styleUrl: './collection-item-card.scss',
})
export class CollectionItemCard {
  name = 'My figurine';
  rarity = "Legendary";
  description = 'A legendary sword of unmatched sharpness and history.';
  price = 199;
}
