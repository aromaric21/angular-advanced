import { ICollectionItemDTO } from './collection-item-dto';

export interface ICollectionDto{
  id?: number;
  title: string;
  items?: ICollectionItemDTO[];
  itemsCount?: number;
}
