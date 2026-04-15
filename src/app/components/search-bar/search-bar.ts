import { Component, input, output, OutputEmitterRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {

  search = input("Initial");
  searchChange = output<string>();
  searchButtonClicked: OutputEmitterRef<void> = output();

  searchClicked() {
    this.searchButtonClicked.emit();
  }

  updateSearch(searchText: string) {
    this.searchChange.emit(searchText);
  }
}
