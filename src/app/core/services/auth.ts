import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from '@angular/fire/auth';
import { doc, Firestore, getDoc, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { type AuthResult, type Credentials, createAuthError, type UserProfile } from '../models';

@Injectable({
  providedIn: 'root',
})
export class Authentication {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // ============================================
  // Firebase Authentication Operations
  // ============================================

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResult<UserProfile>> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      const userProfile = await this.ensureUserProfile(result.user.uid);

      return { success: true, data: userProfile };
    } catch (error: unknown) {
      return {
        success: false,
        error: createAuthError(error),
      };
    }
  }

  /**
   * Create user with email and password
   */
  async createUserWithEmail(credentials: Credentials): Promise<AuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password,
      );

      // Update display name in Firebase Auth
      await updateProfile(userCredential.user, { displayName: credentials.displayName });
      await userCredential.user.reload();

      const userProfile = await this.ensureUserProfile(userCredential.user.uid);

      return { success: true, data: userProfile };
    } catch (error: unknown) {
      return {
        success: false,
        error: createAuthError(error),
      };
    }
  }

  /**
   * TODO: Sign in with Google popup
   */
  async signInWithGooglePopup(): Promise<AuthResult> {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: createAuthError(error),
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOutUser(): Promise<void> {
    await signOut(this.auth);
  }

  /**
   * Update user display name
   */
  async updateDisplayName(displayName: string): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No user logged in');

    await updateProfile(currentUser, { displayName });
  }

  // ============================================
  // Firestore User Profile Operations
  // ============================================

  /**
   * Create user profile in Firestore
   */
  async createUserProfile(userProfile: Omit<UserProfile, 'createdAt'>): Promise<void> {
    await setDoc(doc(this.firestore, 'users', userProfile.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
    });
  }

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));

      if (userDoc.exists()) {
        const data = userDoc.data();

        return {
          uid,
          email: data['email'],
          displayName: data['displayName'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          photoURL: data['photoURL'],
        };
      }

      return null;
    } catch (_) {
      return null;
    }
  }

  /**
   * Update user profile in Firestore
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    await setDoc(doc(this.firestore, 'users', uid), updates, { merge: true });
  }

  /**
   * Check if user profile exists in Firestore
   */
  async userProfileExists(uid: string): Promise<boolean> {
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));
    return userDoc.exists();
  }

  /**
   * Create user profile from Firebase Auth user if it doesn't exist
   */
  async ensureUserProfile(uid: string): Promise<UserProfile | null> {
    // Check if profile exists
    const existingProfile = await this.getUserProfile(uid);
    if (existingProfile) return existingProfile;

    // Create from Firebase Auth data
    const firebaseUser = this.auth.currentUser;
    if (!firebaseUser) return null;

    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || 'User',
      createdAt: serverTimestamp(),
      photoURL: firebaseUser.photoURL || '',
    };

    await this.createUserProfile(newProfile);
    return newProfile;
  }
}
