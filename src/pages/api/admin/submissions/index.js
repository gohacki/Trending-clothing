// src/pages/api/admin/submissions/index.js

import dbConnect from '../../../../lib/mongoose';
import Item from '../../../../models/Item';
import { withAdmin } from '../../../../lib/withAdmin';
import { rateLimiter } from '../../../../middleware/rateLimit';
import { runMiddleware } from '../../../../lib/runMiddleware';

export default withAdmin(async function handler(req, res) {
  if (req.method === 'GET') {
    // Apply Rate Limiting
    await runMiddleware(req, res, rateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    }));

    try {
      const pendingItems = await Item.find({ status: 'pending' }).lean();
      return res.status(200).json({ success: true, data: pendingItems });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch submissions.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
});