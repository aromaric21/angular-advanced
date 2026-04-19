import { Component, effect, inject, input, OnDestroy, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CollectionItem, Rarities } from '../../models/collection-item';
import { Router } from '@angular/router';
import { CollectionService } from '../../services/collection/collection-service';
import { Collection } from '../../models/collection';
import { Subscription } from 'rxjs';
import { CollectionItemCard } from '../../components/collection-item-card/collection-item-card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-collection-item-detail',
  imports: [
    ReactiveFormsModule,
    CollectionItemCard,
    MatButtonModule,
    MatFormField,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './collection-item-detail.html',
  styleUrl: './collection-item-detail.scss',
})
export class CollectionItemDetail implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private collectionService = inject(CollectionService);

  valueChangeSubscription: Subscription | null = null;

  readonly rarities = Object.values(Rarities);

  itemId = input<number | null, string | null>(null, {
    alias: 'id',
    transform: (id: string | null) => (id ? parseInt(id) : null),
  });

  selectedCollection!: Collection;
  collectionItem = signal<CollectionItem>(new CollectionItem());

  itemFormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    image: ['', [Validators.required]],
    rarity: ['Common', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
  });
  protected imageUploader: any;

  constructor() {
    effect(() => {
      let itemToDisplay = new CollectionItem();
      this.selectedCollection = this.collectionService.getAll()[0];
      if (this.itemId()) {
        const itemFound = this.selectedCollection.items.find((item) => item.id === this.itemId());
        if (itemFound) {
          itemToDisplay = itemFound;
        } else {
          this.router.navigate(['not-found']);
        }
      }
      this.itemFormGroup.patchValue(itemToDisplay);
    });
    this.valueChangeSubscription = this.itemFormGroup.valueChanges.subscribe((_) => {
      this.collectionItem.set(Object.assign(new CollectionItem(), this.itemFormGroup.value));
    });
  }

  submit(event: Event) {
    event.preventDefault();

    const itemId = this.itemId();
    if (itemId) {
      this.collectionItem().id = itemId;
      this.collectionService.updateItem(this.selectedCollection, this.collectionItem());
    } else {
      this.collectionService.addItem(this.selectedCollection, this.collectionItem());
    }

    this.router.navigate(['/']);
  }

  deleteItem() {
    const itemId = this.itemId();
    if (itemId) {
      this.collectionService.deleteItem(this.selectedCollection.id, itemId);
    }
    this.router.navigate(['/']);
  }

  cancel() {
    this.router.navigate(['/']);
  }

  isFieldValid(fieldName: string) {
    const formControl = this.itemFormGroup.get(fieldName);
    return formControl?.invalid && (formControl?.dirty || formControl?.touched);
  }

  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('Fichier choisi :', file.name);

      const reader = new FileReader();
      reader.onload = () => {
        //Sauvegarde en base64 dans le Local Storage
        localStorage.setItem('imageData', reader.result as string);
      };
      reader.readAsDataURL(file);
      // 👉 Réinitialiser le champ fichier
      input.value = '';
    }
  }
  ngOnDestroy() {
    this.valueChangeSubscription?.unsubscribe();
  }
}
