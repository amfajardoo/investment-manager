import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import type { AuthResult, UserProfile } from '../models';
import { Authentication } from '../services';
import { I18n } from '../services/i18n';

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withProps(() => ({
    authentication: inject(Authentication),
    router: inject(Router),
    i18n: inject(I18n),
  })),

  withComputed(({ isAuthenticated, user }) => ({
    isLoggedIn: computed(() => isAuthenticated()),
    userDisplayName: computed(() => user()?.displayName ?? ''),
    userEmail: computed(() => user()?.email ?? ''),
  })),

  withMethods((store) => ({
    // Estado centralizado
    setUser(user: UserProfile | null): void {
      patchState(store, {
        user,
        isAuthenticated: !!user,
        error: null,
        isLoading: false,
      });
    },

    setLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },

    setError(error: string): void {
      patchState(store, { error, isLoading: false });
    },

    clearError(): void {
      patchState(store, { error: null });
    },

    updateUserProfile(updates: Partial<UserProfile>): void {
      const currentUser = store.user();
      if (currentUser) {
        patchState(store, {
          user: { ...currentUser, ...updates },
        });
      }
    },

    clearUser(): void {
      patchState(store, {
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    },

    clearState(): void {
      patchState(store, { ...initialState });
    },
  })),

  withMethods((store) => {
    const handleAuthError = (
      result: AuthResult | undefined | unknown,
      fallbackKey: string,
    ): AuthResult => {
      const errorCode = (result as AuthResult | undefined)?.error?.code;
      const field = (result as AuthResult | undefined)?.error?.field;
      const errorMessage = `authErrors.${errorCode}` || fallbackKey;
      store.setError(errorMessage);

      return {
        success: false,
        error: {
          code: errorCode || 'unknown',
          field: field || 'general',
        },
      };
    };

    // Helper para navegación post-autenticación
    const navigateAfterAuth = (path: string = '/dashboard'): void => {
      store.router.navigate([path]);
    };

    return {
      /**
       * Carga el perfil del usuario desde Firestore
       * Se llama automáticamente cuando cambia el estado de Firebase Auth
       */
      async loadUserProfile(uid: string): Promise<void> {
        try {
          const userProfile = await store.authentication.ensureUserProfile(uid);

          if (userProfile) {
            store.setUser(userProfile);
          } else {
            store.setError('loadUserProfile.error');
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          store.setError('loadUserProfile.error');
        }
      },

      /**
       * Registra un nuevo usuario con email y contraseña
       */
      async register(email: string, password: string, displayName: string): Promise<AuthResult> {
        store.setLoading(true);
        store.clearError();

        try {
          const authResult = await store.authentication.createUserWithEmail({
            email,
            password,
            displayName,
          });

          if (!authResult.success) {
            return handleAuthError(authResult, 'register.error');
          }

          if (authResult.data) {
            store.setUser(authResult.data as UserProfile);
          }

          navigateAfterAuth();
          return { success: true };
        } catch (error) {
          return handleAuthError(error, 'register.error');
        }
      },

      /**
       * Inicia sesión con email y contraseña
       */
      async login(email: string, password: string): Promise<AuthResult> {
        store.setLoading(true);
        store.clearError();

        try {
          const result = await store.authentication.signInWithEmail(email, password);

          if (!result.success) {
            return handleAuthError(result, 'login.error');
          }

          if (result.data) {
            store.setUser(result.data as UserProfile);
          }

          navigateAfterAuth();
          return { success: true };
        } catch (error) {
          return handleAuthError(error, 'login.error');
        }
      },

      /**
       * Inicia sesión con Google
       */
      async loginWithGoogle(): Promise<AuthResult> {
        store.setLoading(true);
        store.clearError();

        try {
          const result = await store.authentication.signInWithGooglePopup();

          if (!result.success) {
            return handleAuthError(result, 'loginWithGoogle.error');
          }

          navigateAfterAuth();
          return { success: true };
        } catch (error) {
          return handleAuthError(error, 'loginWithGoogle.error');
        }
      },

      /**
       * Cierra la sesión del usuario actual
       */
      async logout(): Promise<void> {
        store.setLoading(true);

        try {
          await store.authentication.signOutUser();
          store.clearState();
          store.router.navigate(['/login']);
        } catch (error) {
          handleAuthError(error, 'logout.error');
          store.clearState();
          store.router.navigate(['/login']);
        }
      },

      /**
       * Actualiza el nombre de usuario
       */
      async updateDisplayName(displayName: string): Promise<void> {
        const currentUser = store.user();

        if (!currentUser) {
          throw new Error('No user logged in');
        }

        try {
          await store.authentication.updateDisplayName(displayName);
          await store.authentication.updateUserProfile(currentUser.uid, { displayName });
          store.updateUserProfile({ displayName });
        } catch (error) {
          console.error('Error updating display name:', error);
          throw error;
        }
      },
    };
  }),
);
