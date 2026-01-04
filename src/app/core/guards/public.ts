import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store';

export const publicGuard: CanActivateFn = (route) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const isAuthenticated = authStore.isAuthenticated();

  if (!isAuthenticated) {
    return true;
  } else {
    // Get returnUrl from query params or default to dashboard
    const returnUrl = route.queryParams['returnUrl'] || '/dashboard';

    router.navigate([returnUrl]);
    return false;
  }
};
