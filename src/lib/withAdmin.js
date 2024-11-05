// src/lib/withAdmin.js

import { getSession } from 'next-auth/react';

export function withAdmin(handler) {
  return async (req, res) => {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Fetch user from database to check role
    const db = await import('../lib/mongoose').then((mod) => mod.default());
    const User = (await import('../models/User')).default;
    const user = await User.findById(session.user.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
    }

    return handler(req, res);
  };
}