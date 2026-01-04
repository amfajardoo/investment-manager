import { signal } from '@angular/core';
import { email, minLength, required, schema } from '@angular/forms/signals';

export interface LoginFormData {
  email: string;
  password: string;
}

export const initialLoginFormData: LoginFormData = { email: '', password: '' };
export const formModel = signal<LoginFormData>(initialLoginFormData);
export const formDataSchema = schema<LoginFormData>((path) => {
  required(path.email, { message: 'Email is required' });
  email(path.email, { message: 'Invalid email format' });
  required(path.password, { message: 'Password is required' });
  minLength(path.password, 6, { message: 'Password must be at least 6 characters' });
});
