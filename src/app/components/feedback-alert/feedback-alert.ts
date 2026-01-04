import { Component, effect, input, output } from '@angular/core';

const FIVE_SECONDS = 5000;

@Component({
  selector: 'app-feedback-alert',
  imports: [],
  templateUrl: './feedback-alert.html',
  styleUrl: './feedback-alert.css',
})
export class FeedbackAlert {
  readonly timeout = input<number>(FIVE_SECONDS);
  readonly error = input<string | null>(null);
  closeAlert = output<void>();

  constructor() {
    effect(() => {
      if (this.error()) {
        setTimeout(() => {
          this.closeAlert.emit();
        }, this.timeout());
      }
    });
  }
}
