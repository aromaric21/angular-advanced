export class CollectionItem {
  id = -1;
  name = 'Linx';
  description = 'A legendary sword of unmatched sharpness and history.';
  image = 'img/linx.png';
  rarity = 'Legendary';
  price = 250;

  copy(){
    return Object.assign(new CollectionItem(), this);
  }
}
