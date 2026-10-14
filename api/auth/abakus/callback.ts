import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomBytes } from "crypto";
import { exchangeCodeForToken, fetchAbakusUser, baseUrl } from "../../_lib/abakus";
import { db, authAdmin, FieldValue } from "../../_lib/firebase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : "";
    const cookieState = (req.cookies || {}).abakus_oauth_state;

    if (!code || !state || !cookieState || state !== cookieState) {
      res.status(401).send("Invalid OAuth state");
      return;
    }

    res.setHeader(
      "Set-Cookie",
      "abakus_oauth_state=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Lax"
    );

    const redirectUri = `${baseUrl(req)}/api/auth/abakus/callback`;
    const accessToken = await exchangeCodeForToken(code, redirectUri);
    const abakusUser = await fetchAbakusUser(accessToken);

    if (!abakusUser.id) {
      throw new Error("Abakus userdata missing id");
    }

    const uid = `abakus_${abakusUser.id}`;
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    const profileFields = {
      firstName: abakusUser.firstName,
      lastName: abakusUser.lastName,
      email: abakusUser.email,
      abakusUsername: abakusUser.username,
      authUid: uid,
    };

    if (userSnap.exists) {
      await userRef.update(profileFields);
    } else {
      await userRef.create({ ...profileFields, cards: [] });
    }

    const token = await authAdmin.createCustomToken(uid, { abakus: true });

    const oneTimeCode = randomBytes(24).toString("hex");
    await db.collection("authCodes").doc(oneTimeCode).create({
      token,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.statusCode = 302;
    res.setHeader(
      "Location",
      `${baseUrl(req)}/auth/callback?code=${oneTimeCode}`
    );
    res.end();
  } catch (err: any) {
    console.error("Abakus OAuth callback failed:", err);
    res.status(500).send("Authentication failed");
  }
}
