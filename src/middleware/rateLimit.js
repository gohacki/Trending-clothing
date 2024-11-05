// src/middleware/rateLimit.js

const rateLimitMap = new Map();

export function rateLimiter(options) {
  const { windowMs, max, message } = options;

  return async (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }

    const timestamps = rateLimitMap.get(ip).filter(timestamp => timestamp > windowStart);
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);

    if (timestamps.length > max) {
      res.status(429).json({ success: false, message });
      return;
    }

    next();
  };
}