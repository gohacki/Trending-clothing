// src/middleware/ensureAnonymousId.js

import { v4 as uuidv4 } from 'uuid';
import { getCookies, setCookie } from '../utils/cookies';

export async function ensureAnonymousId(req, res) {
  const cookies = getCookies(req);
  let anonymousId = cookies.anonymousId;

  if (!anonymousId) {
    anonymousId = uuidv4();
    // Set cookie to expire in 1 year
    setCookie(res, 'anonymousId', anonymousId, { maxAge: 60 * 60 * 24 * 365, httpOnly: true, sameSite: 'strict' });
  }

  return anonymousId;
}