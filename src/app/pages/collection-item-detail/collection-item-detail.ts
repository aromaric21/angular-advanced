import { Component, inject, input} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-collection-item-detail',
  imports: [FormsModule, RouterLink],
  templateUrl: './collection-item-detail.html',
  styleUrl: './collection-item-detail.scss',
})
export class CollectionItemDetail {

  name= '';

  submit(event: Event){
    event.preventDefault();
    console.log(this.name);
  }
}
