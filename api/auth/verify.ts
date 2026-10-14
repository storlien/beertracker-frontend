import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_lib/firebase";

const ONE_TIME_CODE_TTL_MS = 5 * 60 * 1000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const code = (req.body || {}).code;
  if (typeof code !== "string" || !code) {
    res.status(400).json({ error: "Missing code" });
    return;
  }

  try {
    const snap = await db.collection("authCodes").doc(code).get();

    if (!snap.exists) {
      res.status(400).json({ error: "Invalid or already used code" });
      return;
    }

    const data = snap.data() as { token: string; createdAt?: { toMillis: () => number } };

    if (data.createdAt?.toMillis) {
      const age = Date.now() - data.createdAt.toMillis();
      if (age > ONE_TIME_CODE_TTL_MS) {
        await snap.ref.delete();
        res.status(400).json({ error: "Code expired" });
        return;
      }
    }

    await snap.ref.delete();
    res.status(200).json({ token: data.token });
  } catch (err) {
    console.error("One-time code verification failed:", err);
    res.status(500).json({ error: "Verification failed" });
  }
}
