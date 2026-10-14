import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomBytes } from "crypto";
import { OAUTH, baseUrl } from "../../_lib/abakus";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const state = randomBytes(16).toString("hex");
  res.setHeader(
    "Set-Cookie",
    `abakus_oauth_state=${state}; HttpOnly; Secure; Path=/; Max-Age=600; SameSite=Lax`
  );

  const params = new URLSearchParams({
    client_id: process.env.ABAKUS_CLIENT_ID || "",
    redirect_uri: `${baseUrl(req)}/api/auth/abakus/callback`,
    response_type: "code",
    scope: "user",
    state,
  });

  res.statusCode = 302;
  res.setHeader("Location", `${OAUTH.authorizeUrl}?${params.toString()}`);
  res.end();
}
