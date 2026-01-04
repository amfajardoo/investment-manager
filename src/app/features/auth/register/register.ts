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
import { formDataSchema, formModel } from './register-form';

@Component({
  selector: 'app-register',
  imports: [
    TextInput,
    Field,
    Password,
    LoadingButton,
    FeedbackAlert,
    Divider,
    LayoutCard,
    AuthLayout,
    AuthFooter,
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export default class Register {
  authStore = inject(AuthStore);

  showPassword = signal(false);

  registerForm = form(formModel, formDataSchema);

  get isSubmitting(): boolean {
    return this.authStore.isLoading();
  }

  get isInvalid(): boolean {
    return this.registerForm().invalid();
  }

  async onSubmit(): Promise<void> {
    submit(this.registerForm, async (form) => {
      const value = form().value();

      const result = await this.authStore.register(value.email, value.password, value.displayName);

      if (!result.success && result.error) {
        const errors: ValidationError.WithOptionalField[] = [];

        // Map Firebase error to specific field
        if (result.error.field === 'email') {
          errors.push({
            fieldTree: form.email,
            kind: 'firebaseAuth',
            message: result.error.message,
          });
        } else if (result.error.field === 'password') {
          errors.push({
            fieldTree: form.password,
            kind: 'firebaseAuth',
            message: result.error.message,
          });
        } else if (result.error.field === 'displayName') {
          errors.push({
            fieldTree: form.displayName,
            kind: 'firebaseAuth',
            message: result.error.message,
          });
        }
        // If field is 'general', the error is already shown via authStore.error()

        return errors.length ? errors : undefined;
      }

      return undefined;
    });
  }
}
