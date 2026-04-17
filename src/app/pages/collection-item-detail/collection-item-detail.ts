import { Component} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-collection-item-detail',
  imports: [ReactiveFormsModule],
  templateUrl: './collection-item-detail.html',
  styleUrl: './collection-item-detail.scss',
})
export class CollectionItemDetail {

  nameFormControl = new FormControl('', [Validators.required]);
  priceFormControl = new FormControl(
    0, [Validators.required, Validators.min(0)]
  );

  submit(event: Event) {
    event.preventDefault();
    console.log(this.nameFormControl.value);
    console.log(this.priceFormControl.value);
  }

  setName() {
    this.nameFormControl.setValue('Change Me');
  }
}
