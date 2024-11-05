// src/utils/cookies.js

import cookie from 'cookie';

export function getCookies(req) {
  if (!req.headers.cookie) return {};
  return cookie.parse(req.headers.cookie);
}

export function setCookie(res, name, value, options = {}) {
  const stringValue = typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value);

  if (typeof options.maxAge === 'number') {
    options.expires = new Date(Date.now() + options.maxAge * 1000);
    options.maxAge = options.maxAge;
  }

  res.setHeader('Set-Cookie', cookie.serialize(name, String(stringValue), options));
}