import { computed, Injector, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import type { AuthErrorResult, AuthResult, UserProfile } from '../models';
import { Authentication } from '../services';

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
    fireAuth: inject(Auth),
    authentication: inject(Authentication),
    router: inject(Router),
    injector: inject(Injector),
  })),

  withComputed(({ isAuthenticated }) => ({
    isLoggedIn: computed(() => isAuthenticated()),
  })),

  withMethods((store) => ({
    setUser(user: UserProfile | null): void {
      patchState(store, {
        user,
        isAuthenticated: !!user,
        error: null,
        isLoading: false,
      });
    },

    // Internal: Set loading state
    setLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },

    // Internal: Set error
    setError(error: string): void {
      patchState(store, { error, isLoading: false });
    },

    // Internal: Get error message from Firebase error
    getErrorMessage(error: unknown): string {
      const errorCode = (error as { code?: string })?.code || '';

      switch (errorCode) {
        case 'auth/email-already-in-use':
          return 'Este correo ya está registrado';
        case 'auth/invalid-email':
          return 'Correo electrónico inválido';
        case 'auth/operation-not-allowed':
          return 'Operación no permitida';
        case 'auth/weak-password':
          return 'La contraseña es muy débil';
        case 'auth/user-disabled':
          return 'Esta cuenta ha sido deshabilitada';
        case 'auth/user-not-found':
          return 'No existe una cuenta con este correo';
        case 'auth/wrong-password':
          return 'Contraseña incorrecta';
        case 'auth/invalid-credential':
          return 'Correo o contraseña inválidos';
        case 'auth/popup-closed-by-user':
          return 'Ventana de inicio de sesión cerrada';
        case 'auth/cancelled-popup-request':
          return 'Inicio de sesión cancelado';
        default:
          return (
            (error as { message?: string })?.message || 'Ocurrió un error durante la autenticación'
          );
      }
    },

    // Clear error
    clearError(): void {
      patchState(store, { error: null });
    },

    // Update user profile
    updateUserProfile(updates: Partial<UserProfile>): void {
      const currentUser = store.user();
      if (currentUser) {
        patchState(store, {
          user: { ...currentUser, ...updates },
        });
      }
    },

    // Clear user (logout)
    clearUser(): void {
      patchState(store, {
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    },

    // clear entire state
    clearState(): void {
      patchState(store, { ...initialState });
    },
  })),
  withMethods((store) => ({
    /**
     * Load user profile from Firestore
     * Called automatically when Firebase Auth state changes
     */
    async loadUserProfile(uid: string): Promise<void> {
      try {
        const userProfile = await store.authentication.ensureUserProfile(uid);

        if (userProfile) {
          store.setUser(userProfile);
        } else {
          console.error('Failed to load or create user profile');
          store.setError('Error al cargar el perfil de usuario');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        store.setError('Error al cargar el perfil de usuario');
      }
    },

    /**
     * Register new user with email and password
     */
    async register(email: string, password: string, displayName: string): Promise<AuthResult> {
      store.setLoading(true);
      store.clearError();

      try {
        // Create user in Firebase Auth
        const authResult = await store.authentication.createUserWithEmail({
          email,
          password,
          displayName,
        });

        if (!authResult.success) {
          store.setError(authResult.error?.message || 'Error al crear la cuenta');
          return authResult;
        }

        if (authResult.data) {
          store.setUser(authResult.data as UserProfile);
        }

        // Navigation happens after Firebase Auth state change loads profile
        store.router.navigate(['/dashboard']);

        return { success: true };
      } catch (error: unknown) {
        console.error('Registration error:', error);
        const errorMessage = (error as AuthErrorResult)?.message || 'Error al crear la cuenta';
        store.setError(errorMessage);

        return {
          success: false,
          error: { code: 'unknown', message: errorMessage, field: 'general' },
        };
      }
    },

    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<AuthResult> {
      store.setLoading(true);
      store.clearError();

      try {
        const result = await store.authentication.signInWithEmail(email, password);

        if (!result.success) {
          store.setError(result.error?.message || 'Error al iniciar sesión');
          return { success: result.success };
        }

        if (result.data) {
          store.setUser(result.data as UserProfile);
        }

        // Navigation happens after Firebase Auth state change loads profile
        store.router.navigate(['/dashboard']);

        return { success: true };
      } catch (error: unknown) {
        console.error('Login error:', error);
        const errorMessage = (error as AuthErrorResult)?.message || 'Error al iniciar sesión';
        store.setError(errorMessage);

        return {
          success: false,
          error: { code: 'unknown', message: errorMessage, field: 'general' },
        };
      }
    },

    /**
     * Login with Google
     */
    async loginWithGoogle(): Promise<AuthResult> {
      store.setLoading(true);
      store.clearError();

      try {
        const result = await store.authentication.signInWithGooglePopup();

        if (!result.success) {
          store.setError(result.error?.message || 'Error al iniciar sesión con Google');
          return result;
        }

        // Navigation happens after Firebase Auth state change loads profile
        store.router.navigate(['/dashboard']);

        return { success: true };
      } catch (error: unknown) {
        console.error('Google login error:', error);
        const errorMessage =
          (error as AuthErrorResult)?.message || 'Error al iniciar sesión con Google';
        store.setError(errorMessage);

        return {
          success: false,
          error: { code: 'unknown', message: errorMessage, field: 'general' },
        };
      }
    },

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
      store.setLoading(true);

      try {
        await store.authentication.signOutUser();
        store.clearState();
        store.router.navigate(['/login']);
      } catch (error: unknown) {
        console.error('Logout error:', error);
        const errorMessage = (error as AuthErrorResult)?.message || 'Error al cerrar sesión';
        store.setError(errorMessage);
      }
    },

    /**
     * Update user display name
     */
    async updateDisplayName(displayName: string): Promise<void> {
      try {
        const currentUser = store.user();
        if (!currentUser) throw new Error('No user logged in');

        await store.authentication.updateDisplayName(displayName);
        await store.authentication.updateUserProfile(currentUser.uid, { displayName });

        store.updateUserProfile({ displayName });
      } catch (error: unknown) {
        console.error('Error updating display name:', error);
        throw error;
      }
    },
  })),
);
