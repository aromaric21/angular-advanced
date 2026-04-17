import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Rarities } from '../../models/collection-item';
@Component({
  selector: 'app-collection-item-detail',
  imports: [ReactiveFormsModule],
  templateUrl: './collection-item-detail.html',
  styleUrl: './collection-item-detail.scss',
})
export class CollectionItemDetail {

  private fb = inject(FormBuilder);

  readonly rarities = Object.values(Rarities);

  itemFormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    image: ['', [Validators.required]],
    rarity: [Rarities.Common, [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
  });

  submit(event: Event) {
    event.preventDefault();
    console.log(this.itemFormGroup.value);
  }

  isFieldValid(fieldName: string) {
    const formControl = this.itemFormGroup.get(fieldName);
    return formControl?.invalid && (formControl?.dirty || formControl?.touched);
  }

  onFileChange(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.onload = () => {
        this.itemFormGroup.patchValue({
          image: reader.result as string
        });
        reader.readAsDataURL(file);
      };
    }
  }
}
