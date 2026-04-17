import { Component, inject, input, signal } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-collection-item-detail',
  imports: [FormsModule, FormField],
  templateUrl: './collection-item-detail.html',
  styleUrl: './collection-item-detail.scss',
})
export class CollectionItemDetail {
  formModel = signal({
    name: '',
  });

  testForm = form(this.formModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required!' });
  });

  submit(event: Event) {
    event.preventDefault();
    console.log(this.testForm().value());
  }
}
