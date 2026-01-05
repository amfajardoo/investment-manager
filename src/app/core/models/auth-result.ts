export type AuthErrorCode =
  | 'auth/email-already-in-use'
  | 'auth/invalid-email'
  | 'auth/operation-not-allowed'
  | 'auth/weak-password'
  | 'auth/user-disabled'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/invalid-credential'
  | 'auth/popup-closed-by-user'
  | 'auth/cancelled-popup-request'
  | 'unknown';

export type AuthErrorField = 'email' | 'password' | 'displayName' | 'general';
export type AuthErrorResult = { code?: string };

export interface AuthError {
  code: AuthErrorCode | string;
  field: AuthErrorField;
}

export interface AuthResult<T = unknown> {
  success: boolean;
  error?: AuthError;
  data?: Record<string, unknown> | T | null;
}

export function createAuthError(error: unknown): AuthError {
  const errorCode = ((error as AuthErrorResult)?.code || 'unknown') as AuthErrorCode;

  // Determine which field the error belongs to
  let field: AuthErrorField = 'general';

  switch (errorCode) {
    case 'auth/invalid-email':
    case 'auth/user-not-found':
    case 'auth/email-already-in-use':
      field = 'email';
      break;
    case 'auth/wrong-password':
    case 'auth/weak-password':
      field = 'password';
      break;
    case 'auth/invalid-credential':
      // This could be either email or password
      field = 'general';
      break;
    default:
      field = 'general';
  }

  return {
    code: errorCode,
    field,
  };
}
