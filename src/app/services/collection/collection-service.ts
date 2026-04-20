import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Collection } from '../../models/collection';
import { ICollectionDto } from '../../interfaces/collection-dto';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private BASE_URL = 'http://localhost:3000';
  private COLLECTION_ENDPOINT = '/collections';
  private collectionsEndpoint = this.BASE_URL + this.COLLECTION_ENDPOINT;

  private http = inject(HttpClient);

  selectedCollection = signal<Collection | null>(null);

  getAll(): Observable<Collection[]> {
    return this.http.get<ICollectionDto[]>(this.collectionsEndpoint).pipe(
      map((collectionListData) => {
        return collectionListData.map((collectionData) => Collection.fromDTO(collectionData));
      }),
    );
  }

  get(id: number): Observable<Collection> {
    const url = `${this.BASE_URL}${this.COLLECTION_ENDPOINT}/${id}`;
    return this.http
      .get<ICollectionDto>(url)
      .pipe(map((collectionData) => Collection.fromDTO(collectionData)));
  }
}
