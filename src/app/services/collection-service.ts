import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {

  hello(){
    console.log('Hello CollectionService');
  }
}
