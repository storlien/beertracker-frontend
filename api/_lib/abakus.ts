import type { VercelRequest } from "@vercel/node";

export const ABAKUS_API = "https://lego.abakus.no";

export const OAUTH = {
  authorizeUrl: `${ABAKUS_API}/authorization/oauth2/authorize/`,
  tokenUrl: `${ABAKUS_API}/authorization/oauth2/token/`,
  userdataUrl: `${ABAKUS_API}/api/v1/users/oauth2_userdata/`,
};

export function baseUrl(req: VercelRequest): string {
  const host = req.headers.host || "";
  const proto =
    typeof req.headers["x-forwarded-proto"] === "string"
      ? req.headers["x-forwarded-proto"]
      : "https";
  return `${proto}://${host}`;
}

export interface AbakusUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: process.env.ABAKUS_CLIENT_ID || "",
    client_secret: process.env.ABAKUS_CLIENT_SECRET || "",
  });

  const res = await fetch(OAUTH.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Abakus token exchange failed:", res.status, text);
    throw new Error(`Token exchange failed (${res.status})`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error("No access token in response");
  }
  return data.access_token as string;
}

export async function fetchAbakusUser(accessToken: string): Promise<AbakusUser> {
  const res = await fetch(OAUTH.userdataUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    console.error("Abakus userdata fetch failed:", res.status);
    throw new Error(`Fetching Abakus userdata failed (${res.status})`);
  }

  const data = await res.json();
  return {
    id: String(data.id ?? ""),
    username: String(data.username ?? ""),
    firstName: String(data.firstName ?? ""),
    lastName: String(data.lastName ?? ""),
    email: String(data.email ?? ""),
  };
}
