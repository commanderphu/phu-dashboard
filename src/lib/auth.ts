// src/lib/auth.ts
//
// Anmeldung am Keycloak (Realm homelab, Client phu-dashboard) per
// Authorization Code Flow mit PKCE (S256) — ohne Zusatzbibliothek, nur mit
// Web-Crypto und fetch (PhuOS Phase 2, Paket 0).
//
// Ablauf:
//   1. login(): code_verifier erzeugen, merken, zu Keycloak umleiten
//   2. Keycloak leitet nach /auth/callback?code=…&state=… zurück
//   3. handleCallback(): Code gegen Tokens tauschen, Tokens im sessionStorage
//   4. getAccessToken(): liefert gültigen Access-Token, erneuert ihn bei Bedarf
//      über den Refresh-Token
//
// Tokens liegen im sessionStorage (pro Tab, weg beim Schließen). Die
// Keycloak-Sitzung bleibt per Cookie bestehen — ein neuer Tab meldet sich
// deshalb ohne erneute Passworteingabe an.

// window.__APP_CONFIG__ ist in src/lib/api.ts deklariert.
export const AUTH_ISSUER: string =
  window.__APP_CONFIG__?.authIssuer?.trim() ||
  import.meta.env.VITE_AUTH_ISSUER ||
  "https://login.phudevelopement.xyz/realms/homelab";

export const AUTH_CLIENT_ID: string =
  window.__APP_CONFIG__?.authClientId?.trim() ||
  import.meta.env.VITE_AUTH_CLIENT_ID ||
  "phu-dashboard";

const CALLBACK_PATH = "/auth/callback";
const TOKENS_KEY = "phu:auth:tokens";
const PENDING_KEY = "phu:auth:pending";
const REFRESH_MARGIN_S = 30;

type Tokens = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_at: number; // Unix-Sekunden
  refresh_expires_at?: number;
};

type Pending = { verifier: string; state: string; returnTo: string };

export type AuthUser = { name: string; username: string; email?: string };

const redirectUri = () => `${window.location.origin}${CALLBACK_PATH}`;

function randomString(bytes = 32): string {
  const buf = crypto.getRandomValues(new Uint8Array(bytes));
  return base64url(buf);
}

function base64url(buf: Uint8Array): string {
  let s = "";
  buf.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function challenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

function decodeJwt<T>(jwt: string): T | null {
  try {
    const part = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(part)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function readTokens(): Tokens | null {
  try {
    const raw = sessionStorage.getItem(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  } catch {
    return null;
  }
}

function storeTokens(body: {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  refresh_expires_in?: number;
}) {
  const now = Math.floor(Date.now() / 1000);
  const t: Tokens = {
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    id_token: body.id_token,
    expires_at: now + body.expires_in,
    refresh_expires_at: body.refresh_expires_in ? now + body.refresh_expires_in : undefined,
  };
  sessionStorage.setItem(TOKENS_KEY, JSON.stringify(t));
}

const tokenEndpoint = () => `${AUTH_ISSUER}/protocol/openid-connect/token`;

/** Leitet zur Keycloak-Anmeldung um. */
export async function login(returnTo = window.location.pathname + window.location.search): Promise<void> {
  const verifier = randomString(48);
  const state = randomString(16);
  const pending: Pending = { verifier, state, returnTo };
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));

  const url = new URL(`${AUTH_ISSUER}/protocol/openid-connect/auth`);
  url.searchParams.set("client_id", AUTH_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", await challenge(verifier));
  url.searchParams.set("code_challenge_method", "S256");
  window.location.assign(url.toString());
}

export function isCallback(): boolean {
  return window.location.pathname === CALLBACK_PATH;
}

/** Verarbeitet /auth/callback und liefert den Pfad, zu dem zurückgekehrt wird. */
export async function handleCallback(): Promise<string> {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  if (error) throw new Error(params.get("error_description") || error);

  const raw = sessionStorage.getItem(PENDING_KEY);
  sessionStorage.removeItem(PENDING_KEY);
  const pending = raw ? (JSON.parse(raw) as Pending) : null;
  if (!pending || pending.state !== params.get("state")) {
    throw new Error("Anmeldung abgelaufen oder ungültig — bitte neu anmelden.");
  }

  const res = await fetch(tokenEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: AUTH_CLIENT_ID,
      code: params.get("code") ?? "",
      redirect_uri: redirectUri(),
      code_verifier: pending.verifier,
    }),
  });
  if (!res.ok) throw new Error(`Token-Abruf fehlgeschlagen (HTTP ${res.status})`);
  storeTokens(await res.json());
  return pending.returnTo.startsWith("/") && !pending.returnTo.startsWith(CALLBACK_PATH)
    ? pending.returnTo
    : "/";
}

let refreshing: Promise<string | null> | null = null;

async function refresh(t: Tokens): Promise<string | null> {
  if (!t.refresh_token) return null;
  const now = Math.floor(Date.now() / 1000);
  if (t.refresh_expires_at && t.refresh_expires_at <= now) return null;

  const res = await fetch(tokenEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: AUTH_CLIENT_ID,
      refresh_token: t.refresh_token,
    }),
  });
  if (!res.ok) {
    sessionStorage.removeItem(TOKENS_KEY);
    return null;
  }
  const body = await res.json();
  storeTokens(body);
  return body.access_token as string;
}

/** Gültiger Access-Token oder null (dann ist eine Anmeldung nötig). */
export async function getAccessToken(): Promise<string | null> {
  const t = readTokens();
  if (!t) return null;
  const now = Math.floor(Date.now() / 1000);
  if (t.expires_at - REFRESH_MARGIN_S > now) return t.access_token;
  refreshing ??= refresh(t).finally(() => (refreshing = null));
  return refreshing;
}

export function currentUser(): AuthUser | null {
  const t = readTokens();
  const claims = t && decodeJwt<{ name?: string; preferred_username?: string; email?: string }>(t.id_token ?? t.access_token);
  if (!claims) return null;
  return {
    name: claims.name ?? claims.preferred_username ?? "?",
    username: claims.preferred_username ?? "?",
    email: claims.email,
  };
}

/** Meldet lokal und bei Keycloak ab. */
export function logout(): void {
  const t = readTokens();
  sessionStorage.removeItem(TOKENS_KEY);
  const url = new URL(`${AUTH_ISSUER}/protocol/openid-connect/logout`);
  url.searchParams.set("client_id", AUTH_CLIENT_ID);
  url.searchParams.set("post_logout_redirect_uri", `${window.location.origin}/`);
  if (t?.id_token) url.searchParams.set("id_token_hint", t.id_token);
  window.location.assign(url.toString());
}

/**
 * fetch mit Bearer-Token. Für schreibende Aufrufe an den api-hub verwenden.
 * Ohne gültigen Token geht die Anfrage trotzdem raus (der api-hub entscheidet
 * je nach AUTH_MODE).
 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
