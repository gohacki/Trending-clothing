// src/pages/api/wardrobe/[itemId].js

import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User';
import Item from '../../../models/Item';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import { rateLimiter } from '../../../middleware/rateLimit';
import { runMiddleware } from '../../../lib/runMiddleware';

export default async function handler(req, res) {
  const { method } = req;
  const { itemId } = req.query;

  // Apply Rate Limiting
  await runMiddleware(
    req,
    res,
    rateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    })
  );

  // Get user session using getServerSession
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  await dbConnect();

  switch (method) {
    case 'DELETE':
      try {
        // Verify that the item exists and is in the user's wardrobe
        const user = await User.findById(session.user.id);

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (!user.wardrobe.includes(itemId)) {
          return res.status(400).json({ success: false, message: 'Item not in wardrobe.' });
        }

        // Remove the item from the wardrobe
        user.wardrobe = user.wardrobe.filter(id => id.toString() !== itemId);
        await user.save();

        return res.status(200).json({ success: true, message: 'Item removed from wardrobe.' });
      } catch (error) {
        console.error('Error removing from wardrobe:', error);
        return res.status(500).json({ success: false, message: 'Failed to remove item from wardrobe.' });
      }

    default:
      res.setHeader('Allow', ['DELETE']);
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}