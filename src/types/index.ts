export interface Card {
  cardNumber: string;
  sum: number;
  linkedUserId?: string;
  lastPurchaseHash?: string;
  updatedAt?: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  cards: string[];
}

export interface SyncState {
  lastPurchaseHash: string;
  lastSyncAt?: Date;
  totalPurchasesSynced?: number;
}

export interface AuthState {
  user: FirebaseUser | null;
  isAdmin: boolean;
  loading: boolean;
}

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
