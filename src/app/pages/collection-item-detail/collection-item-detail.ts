import { Component} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Rarities } from '../../models/collection-item';
@Component({
  selector: 'app-collection-item-detail',
  imports: [ReactiveFormsModule],
  templateUrl: './collection-item-detail.html',
  styleUrl: './collection-item-detail.scss',
})
export class CollectionItemDetail {

  readonly rarities = Object.values(Rarities);

  itemFormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    rarity: new FormControl(Rarities.Common, [Validators.required]),
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
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
