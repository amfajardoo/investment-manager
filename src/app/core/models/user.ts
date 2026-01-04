import type { FieldValue, Timestamp } from '@angular/fire/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt?: Timestamp | FieldValue;
  photoURL: string;
}
