import { Component, inject } from '@angular/core';
import { I18n } from '../../core/services/i18n';

@Component({
  selector: 'app-language-selector',
  imports: [],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.css',
})
export class LanguageSelector {
  i18n = inject(I18n);

  changeLanguage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedLang = selectElement.value;
    this.i18n.setActiveLang(selectedLang);
  }
}
