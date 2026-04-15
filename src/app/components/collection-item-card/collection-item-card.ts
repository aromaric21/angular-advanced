import { Component, input } from '@angular/core';
import { CollectionItem } from '../../models/collection-item';
import { interval } from 'rxjs';

@Component({
  selector: 'app-collection-item-card',
  imports: [],
  templateUrl: './collection-item-card.html',
  styleUrl: './collection-item-card.scss',
})
export class CollectionItemCard {
  item = input.required<CollectionItem>();
}
