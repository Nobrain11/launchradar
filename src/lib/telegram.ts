/**
 * Telegram URL validation service for LaunchRadar.
 * Critical: Only public group/channel links are accepted.
 * Never treat presence of a URL as proof of legitimacy.
 */

const TELEGRAM_HOSTS = ["t.me", "telegram.me", "telegram.org"];

export interface TelegramValidationResult {
  valid: boolean;
  normalized?: string;
  reason?: string;
  username?: string;
}

/**
 * Normalize and validate a potential Telegram URL.
 * Accepts: https://t.me/username, https://telegram.me/username, t.me/username
 * Rejects: private invites, empty, non-telegram, malformed.
 */
export function validateTelegramUrl(input: string | null | undefined): TelegramValidationResult {
  if (!input || typeof input !== "string") {
    return { valid: false, reason: "Empty or missing Telegram link" };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, reason: "Empty Telegram link" };
  }

  // Reject obvious non-links
  if (trimmed.length < 5) {
    return { valid: false, reason: "Link too short" };
  }

  let urlStr = trimmed;

  // Allow bare username-style or host without protocol
  if (!/^https?:\/\//i.test(urlStr)) {
    if (/^(t\.me|telegram\.me|telegram\.org)\//i.test(urlStr)) {
      urlStr = "https://" + urlStr;
    } else if (/^[a-zA-Z0-9_]{4,}$/.test(urlStr)) {
      // Bare username -> assume public channel
      urlStr = `https://t.me/${urlStr}`;
    } else {
      return { valid: false, reason: "Unrecognized Telegram URL format" };
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { valid: false, reason: "Invalid URL syntax" };
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (!TELEGRAM_HOSTS.includes(host)) {
    return { valid: false, reason: "Not a Telegram domain" };
  }

  // Path must be /username or /+invite or /joinchat/...
  const path = parsed.pathname.replace(/\/+$/, "");
  if (!path || path === "/") {
    return { valid: false, reason: "Missing channel/group path" };
  }

  // Reject private invite links for the public feed (we only want public groups/channels)
  // Public: /username (no +)
  // Private: /+hash or /joinchat/hash
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { valid: false, reason: "Empty path" };
  }

  const first = segments[0];

  // Allow public usernames only for the discovery feed
  if (first.startsWith("+") || first.toLowerCase() === "joinchat" || first.toLowerCase() === "addstickers") {
    return {
      valid: false,
      reason: "Private invite or non-public link rejected for discovery feed",
    };
  }

  // Basic public username validation
  if (!/^[a-zA-Z][a-zA-Z0-9_]{3,31}$/.test(first) && !/^[a-zA-Z0-9_]{5,32}$/.test(first)) {
    // Still accept many real public ones; be relatively permissive for public channels
    if (first.length < 4 || first.length > 64) {
      return { valid: false, reason: "Invalid public username format" };
    }
  }

  // Normalize to canonical https://t.me/username
  const username = first;
  const normalized = `https://t.me/${username}`;

  return {
    valid: true,
    normalized,
    username,
  };
}

/**
 * Extract the first valid Telegram link from a list of candidate strings (e.g. from metadata).
 */
export function extractValidTelegram(candidates: (string | null | undefined)[]): TelegramValidationResult {
  for (const c of candidates) {
    const result = validateTelegramUrl(c);
    if (result.valid) return result;
  }
  return { valid: false, reason: "No valid public Telegram link found" };
}

/**
 * Check if a token record has a usable public Telegram for the main feed.
 */
export function hasValidPublicTelegram(socials: { telegram?: string | null }): boolean {
  return validateTelegramUrl(socials?.telegram).valid;
}
