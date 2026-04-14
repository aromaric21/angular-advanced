import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<h1>Heello World!</h1>',
  styles: `h1{
    background-color: black;
    color: white;
  }`
})
export class App {
  protected readonly title = signal('collection-manager');
}
