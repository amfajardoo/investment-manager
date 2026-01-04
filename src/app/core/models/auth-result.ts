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
export type AuthErrorResult = { code?: string; message?: string };

export interface AuthError {
  code: AuthErrorCode;
  message: string;
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

  // Get user-friendly message
  const message = getErrorMessage(errorCode);

  return {
    code: errorCode,
    message,
    field,
  };
}

function getErrorMessage(code: AuthErrorCode): string {
  switch (code) {
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
      return 'Ocurrió un error durante la autenticación';
  }
}
