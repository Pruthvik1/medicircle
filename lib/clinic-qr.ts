// Clinic QR codes encode either the web check-in URL (https://…/c/<slug>) or
// the app link (medicircle://c/<slug>). Returns the clinic slug, or null if
// the code isn't one of ours.
export function parseClinicQr(data: string): string | null {
  const match = data
    .trim()
    .match(/^(?:https?:\/\/[^/]+|medicircle:\/\/)\/?c\/([a-z0-9-]+)\/?(?:[?#].*)?$/i);
  return match ? match[1].toLowerCase() : null;
}

// What the clinic QR code encodes. Walk-ins without the app land on the web page.
export function buildClinicUrl(slug: string): string {
  const base = (process.env.EXPO_PUBLIC_WEB_URL ?? 'https://medicircle.app').replace(/\/$/, '');
  return `${base}/c/${slug}`;
}
