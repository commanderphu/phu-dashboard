// Links, die auf dem Handy die native App öffnen statt der Webseite.
//
// Die Workmate-App reagiert seit 18.11.2026 auf den Deep Link workmate://open
// (VIEW/BROWSABLE-Filter an der MainActivity). Browser starten Apps nur über
// solche BROWSABLE-Einträge — ein reiner Paket-Intent wurde von Brave ignoriert.
// Der intent:-Link nennt zusätzlich das Paket und eine Fallback-URL: ist die
// App nicht installiert, öffnet sich die Web-Oberfläche. Auf allen anderen
// Geräten bleibt es die Webseite.

const WORKMATE_WEB = "https://workmate-private.phudevelopement.xyz";
const WORKMATE_PACKAGE = "xyz.phudevelopement.workmate_private";

export function isAndroid(): boolean {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
}

/** Link zu Workmate: auf Android die App, sonst die Web-Oberfläche. */
export function workmateLink(): { href: string; isApp: boolean } {
  if (!isAndroid()) return { href: WORKMATE_WEB, isApp: false };
  const fallback = encodeURIComponent(WORKMATE_WEB);
  return {
    href:
      `intent://open#Intent;scheme=workmate;package=${WORKMATE_PACKAGE};` +
      `category=android.intent.category.BROWSABLE;` +
      `S.browser_fallback_url=${fallback};end`,
    isApp: true,
  };
}
