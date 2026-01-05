import { Component, effect, input, model, signal } from '@angular/core';
import type { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-password',
  imports: [TranslocoPipe],
  templateUrl: './password.html',
  styleUrl: './password.css',
})
export class Password implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = input<boolean>(false);

  readonly fieldId = input.required<string>();
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly inputClasses = input<string>('');
  showPassword = signal(false);

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.value.set('');
      }
    });
  }

  changeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
  }
}
