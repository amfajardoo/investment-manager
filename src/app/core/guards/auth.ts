import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';

export const authGuard: CanActivateFn = (_, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const isAuthenticated = authStore.isAuthenticated();

  if (!isAuthenticated) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return isAuthenticated;
  }

  return isAuthenticated;
};
