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
  totalPagesSynced?: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  isUser: boolean;
  sum: number;
  cards: string[];
}

export interface DailyLeaderboardDoc {
  barDay: string;
  entries: LeaderboardEntry[];
  updatedAt?: Date;
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
