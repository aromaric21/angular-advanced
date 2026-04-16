import { Component, inject, input} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-collection-item-detail',
  imports: [FormsModule],
  templateUrl: './collection-item-detail.html',
  styleUrl: './collection-item-detail.scss',
})
export class CollectionItemDetail{

  private readonly activedRoute = inject(ActivatedRoute);
  private readonly  router = inject(Router);

  itemId = input<number | null, string | null>(null, {
    alias: 'id',
    transform: value => value ? parseInt(value) : null,
  });

  next() {
    const currentId = this.itemId();
    if (currentId) {
      const nextId = currentId + 1;
      this.router.navigate(['item', nextId]);
    }
  }
}
