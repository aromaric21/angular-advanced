import { Component, inject, input, linkedSignal, OnDestroy, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CollectionItem, Rarities } from '../../models/collection-item';
import { Router } from '@angular/router';
import { CollectionService } from '../../services/collection/collection-service';
import { catchError, EMPTY, filter, Subscription, switchMap, tap } from 'rxjs';
import { CollectionItemCard } from '../../components/collection-item-card/collection-item-card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CollectionItemService } from '../../services/collection-item/collection-item-service';


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
export class CollectionItemDetail {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private readonly collectionService = inject(CollectionService);
  private readonly collectionItemService = inject(CollectionItemService);

  valueChangeSubscription: Subscription | null = null;

  rarities = Object.values(Rarities);

  itemId = input<number | undefined, string | undefined>(undefined, {
    alias: 'id',
    transform: (id: string | undefined) => (id ? parseInt(id) : undefined),
  });

  selectedCollection = linkedSignal(() => this.collectionService.selectedCollection());
  collectionItem = signal<CollectionItem>(new CollectionItem());

  itemFormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    image: ['', [Validators.required]],
    rarity: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
  });

  collectionItem$ = toObservable(this.itemId).pipe(
    takeUntilDestroyed(),
    filter((itemId) => itemId !== undefined),
    switchMap((itemId) => this.collectionItemService.get(itemId)),
    tap((item) => {
      this.collectionItem.set(item);
      this.itemFormGroup.patchValue(item);
    }),
  );

  itemCollection$ = this.collectionItem$.pipe(
    takeUntilDestroyed(),
    switchMap((item) => this.collectionService.get(item.collectionId)),
    catchError((error) => {
      this.navigateBack();
      return EMPTY;
    }),
    tap((collection) => {
      this.selectedCollection.set(collection);
    }),
  );

  formValueChanges$ = this.itemFormGroup.valueChanges.pipe(
    takeUntilDestroyed(),
    tap((_) => {
      this.collectionItem.set(
        Object.assign(new CollectionItem(), {
          ...this.itemFormGroup.value,
          id: this.itemId(),
          collectionId: this.selectedCollection()?.id,
        }),
      );
    }),
  );

  constructor() {
    this.collectionItem$.subscribe();
    this.formValueChanges$.subscribe();
  }

  submit(event: Event) {
    event.preventDefault();

    const item = this.collectionItem();
    if (!item) return;

    let saveObservable = null;
    if (item.id) {
      saveObservable = this.collectionItemService.update(item);
    } else {
      saveObservable = this.collectionItemService.add(item);
    }

    saveObservable.subscribe(() => {
      this.navigateBack();
    });
  }

  deleteItem() {
    const item = this.collectionItem();
    if (item) {
      this.collectionItemService.delete(item).subscribe(() => {
        this.navigateBack();
      });
    }
  }

  navigateBack() {
    this.router.navigate(['/']);
  }

  isFieldValid(fieldName: string) {
    const formControl = this.itemFormGroup.get(fieldName);
    return formControl?.invalid && (formControl?.dirty || formControl?.touched);
  }

  //previewImage: string | null = null;

  onFileChange(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.itemFormGroup.patchValue({
          image: reader.result as string,
        });
      };
    }
  }
}
