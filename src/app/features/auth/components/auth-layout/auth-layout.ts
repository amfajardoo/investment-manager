import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageSelector } from '../../../../components/language-selector/language-selector';

@Component({
  selector: 'app-auth-layout',
  imports: [TranslocoPipe, LanguageSelector],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
}
