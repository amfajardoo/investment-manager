import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-loading-button',
  imports: [TranslocoPipe],
  templateUrl: './loading-button.html',
  styleUrl: './loading-button.css',
})
export class LoadingButton {
  readonly disabled = input<boolean>(false);
  readonly isLoading = input<boolean>(false);
  readonly buttonType = input<'button' | 'submit' | 'reset'>('button');
  readonly buttonText = input<string>('Submit');
  readonly loadingText = input<string>('Loading...');
}
