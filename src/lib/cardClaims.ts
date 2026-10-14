import {
  doc,
  runTransaction,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";

const UNLINKED = "";

export async function claimCard(
  userDocId: string,
  cardNumber: string
): Promise<void> {
  if (!/^\d{10}$/.test(cardNumber)) {
    throw new Error("Card number must be exactly 10 digits");
  }

  const cardRef = doc(db, "cards", cardNumber);
  const userRef = doc(db, "users", userDocId);

  await runTransaction(db, async (tx) => {
    const [cardSnap, userSnap] = await Promise.all([
      tx.get(cardRef),
      tx.get(userRef),
    ]);

    if (!userSnap.exists()) {
      throw new Error("User profile not found");
    }

    if (!cardSnap.exists()) {
      tx.set(cardRef, { sum: 0, linkedUserId: userDocId });
      tx.update(userRef, { cards: arrayUnion(cardNumber) });
      return;
    }

    const linkedTo = cardSnap.data().linkedUserId ?? UNLINKED;

    if (linkedTo !== UNLINKED && linkedTo !== userDocId) {
      throw new Error("Card is already linked to another user");
    }

    if (linkedTo === userDocId) {
      return;
    }

    tx.update(cardRef, { linkedUserId: userDocId });
    tx.update(userRef, { cards: arrayUnion(cardNumber) });
  });
}

export async function unclaimCard(
  userDocId: string,
  cardNumber: string
): Promise<void> {
  const cardRef = doc(db, "cards", cardNumber);
  const userRef = doc(db, "users", userDocId);

  await runTransaction(db, async (tx) => {
    const cardSnap = await tx.get(cardRef);

    if (!cardSnap.exists()) {
      tx.update(userRef, { cards: arrayRemove(cardNumber) });
      return;
    }

    const linkedTo = cardSnap.data().linkedUserId ?? UNLINKED;

    if (linkedTo !== userDocId) {
      throw new Error("Card is not linked to you");
    }

    tx.update(cardRef, { linkedUserId: UNLINKED });
    tx.update(userRef, { cards: arrayRemove(cardNumber) });
  });
}
