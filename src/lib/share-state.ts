/**
 * Encode/decode the user profile to a compact URL fragment so a session can
 * be shared via a single link. Uses base64url(JSON) for portability.
 */

import type { UserProfile } from './scoring';

const KEY = 's'; // ?s=...

export function encodeProfile(profile: UserProfile): string {
  const minimal: Record<string, any> = {};
  for (const [k, v] of Object.entries(profile)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === 'string' && v === '') continue;
    minimal[k] = v;
  }
  const json = JSON.stringify(minimal);
  if (typeof window === 'undefined') {
    return Buffer.from(json, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function decodeProfile(token: string): Partial<UserProfile> | null {
  try {
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    let json: string;
    if (typeof window === 'undefined') {
      json = Buffer.from(padded, 'base64').toString('utf8');
    } else {
      json = decodeURIComponent(escape(atob(padded)));
    }
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function buildShareUrl(profile: UserProfile): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.searchParams.set(KEY, encodeProfile(profile));
  return url.toString();
}

export function readProfileFromLocation(): Partial<UserProfile> | null {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  const token = url.searchParams.get(KEY);
  if (!token) return null;
  return decodeProfile(token);
}

export const SHARE_KEY = KEY;
