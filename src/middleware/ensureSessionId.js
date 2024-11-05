// src/middleware/ensureSessionId.js

import { v4 as uuidv4 } from 'uuid';
import { getCookies, setCookie } from '../utils/cookies';

export async function ensureSessionId(req, res) {
  const cookies = getCookies(req);
  let sessionId = cookies.sessionId;

  if (!sessionId) {
    sessionId = uuidv4();
    // Set cookie to expire in 1 year
    setCookie(res, 'sessionId', sessionId, { maxAge: 60 * 60 * 24 * 365, httpOnly: true, sameSite: 'strict' });
  }

  return sessionId;
}