import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-auth-footer',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './auth-footer.html',
  styleUrl: './auth-footer.css',
})
export class AuthFooter {
  readonly text = input.required<string>();
  readonly linkText = input.required<string>();
  readonly redirectTo = input.required<string>();
}
