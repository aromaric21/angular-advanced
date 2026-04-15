import { ChangeDetectionStrategy, Component, model, output, OutputEmitterRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBar {

  search = model("Initial");
  searchButtonClicked: OutputEmitterRef<void> = output<void>();

  searchClicked() {
    this.searchButtonClicked.emit();
  }
}
