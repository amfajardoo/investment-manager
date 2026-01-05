import { Component, inject, signal } from '@angular/core';
import { Field, form, submit, type ValidationError } from '@angular/forms/signals';
import { Divider } from '../../../components/divider/divider';
import { FeedbackAlert } from '../../../components/feedback-alert/feedback-alert';
import { LayoutCard } from '../../../components/layout-card/layout-card';
import { LoadingButton } from '../../../components/loading-button/loading-button';
import { Password } from '../../../components/password/password';
import { TextInput } from '../../../components/text-input/text-input';
import { AuthStore } from '../../../core/store';
import { AuthFooter } from '../components/auth-footer/auth-footer';
import { AuthLayout } from '../components/auth-layout/auth-layout';
import { formDataSchema, formModel } from './login-form';

@Component({
  selector: 'app-login',
  imports: [
    AuthFooter,
    TextInput,
    Field,
    Password,
    LoadingButton,
    FeedbackAlert,
    Divider,
    LayoutCard,
    AuthLayout,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export default class Login {
  authStore = inject(AuthStore);

  showPassword = signal(false);

  loginForm = form(formModel, formDataSchema);

  get isSubmitting(): boolean {
    return this.authStore.isLoading();
  }

  get isInvalid(): boolean {
    return this.loginForm().invalid();
  }

  async onSubmit(): Promise<void> {
    submit(this.loginForm, async (form) => {
      const value = form().value();

      const result = await this.authStore.login(value.email, value.password);

      if (!result.success && result.error) {
        const errors: ValidationError.WithOptionalField[] = [];

        // Map Firebase error to specific field
        if (result.error.field === 'email') {
          errors.push({
            fieldTree: form.email,
            kind: 'firebaseAuth',
            message: `authErrors.${result.error?.code}`,
          });
        } else if (result.error.field === 'password') {
          errors.push({
            fieldTree: form.password,
            kind: 'firebaseAuth',
            message: `authErrors.${result.error?.code}`,
          });
        }
        // If field is 'general', the error is already shown via authStore.error()

        return errors.length ? errors : undefined;
      }

      return undefined;
    });
  }
}
