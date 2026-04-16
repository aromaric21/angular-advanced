import { Component, inject, input} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-collection-item-detail',
  imports: [],
  templateUrl: './collection-item-detail.html',
  styleUrl: './collection-item-detail.scss',
})
export class CollectionItemDetail{

  private readonly activedRoute = inject(ActivatedRoute);
  private readonly  router = inject(Router);

  id = input<string | null>(null);

  next() {
    const currentId = this.id();
    if (currentId) {
      const nextId = parseInt(currentId) + 1;
      this.router.navigate(['item', nextId]);
    }
  }
}
