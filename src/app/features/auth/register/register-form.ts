import { signal } from '@angular/core';
import { email, minLength, required, schema, validate } from '@angular/forms/signals';

export interface RegisterFormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const initialRegisterFormData: RegisterFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  displayName: '',
};
export const formModel = signal<RegisterFormData>(initialRegisterFormData);
export const formDataSchema = schema<RegisterFormData>((path) => {
  required(path.displayName, { message: 'Display Name is required' });
  required(path.email, { message: 'Email is required' });
  email(path.email, { message: 'Invalid email format' });
  required(path.password, { message: 'Password is required' });
  minLength(path.password, 6, { message: 'Password must be at least 6 characters' });
  required(path.confirmPassword, { message: 'Confirm Password is required' });
  validate(path.confirmPassword, (data) => {
    const password = data.valueOf(path.password);
    const confirmPassword = data.value();

    if (password !== confirmPassword) {
      return { kind: 'passwordMismatch', message: 'Passwords do not match' };
    }

    return null;
  });
});
