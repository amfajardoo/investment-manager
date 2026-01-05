import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class I18n {
  transloco = inject(TranslocoService);

  safeTranslate(key: string, params?: Record<string, unknown>): string {
    const translation = this.transloco.translate(key, params);
    return translation !== key ? translation : '';
  }

  getActiveLang(): string {
    return this.transloco.getActiveLang();
  }

  setActiveLang(lang: string): void {
    this.transloco.setActiveLang(lang);
  }
}
