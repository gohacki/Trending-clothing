// src/pages/api/wardrobe/index.js

import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User';
import Item from '../../../models/Item';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { rateLimiter } from '../../../middleware/rateLimit';
import { runMiddleware } from '../../../lib/runMiddleware';

export default async function handler(req, res) {
  const { method } = req;

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
    case 'GET':
      try {
        // Fetch the user's wardrobe items
        const user = await User.findById(session.user.id).populate('wardrobe').lean();

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const wardrobeItems = (user.wardrobe || []).map((item) => ({
          ...item,
          _id: item._id.toString(),
          createdAt: item.createdAt ? item.createdAt.toISOString() : null,
          updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
        }));

        return res.status(200).json({ success: true, data: wardrobeItems });
      } catch (error) {
        console.error('Error fetching wardrobe:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch wardrobe.' });
      }

    case 'POST':
      try {
        const { itemId } = req.body;

        if (!itemId) {
          return res.status(400).json({ success: false, message: 'Item ID is required.' });
        }

        // Validate that the item exists and is approved
        const item = await Item.findById(itemId);

        if (!item) {
          return res.status(404).json({ success: false, message: 'Item not found.' });
        }

        if (item.status !== 'approved') {
          return res.status(400).json({ success: false, message: 'Only approved items can be added to wardrobe.' });
        }

        // Fetch the user
        const user = await User.findById(session.user.id);

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Check if the item is already in the wardrobe
        if (user.wardrobe.includes(itemId)) {
          return res.status(400).json({ success: false, message: 'Item is already in your wardrobe.' });
        }

        // Add the item to the wardrobe
        user.wardrobe.push(itemId);
        await user.save();

        return res.status(200).json({ success: true, message: 'Item added to wardrobe.' });
      } catch (error) {
        console.error('Error adding item to wardrobe:', error);
        return res.status(500).json({ success: false, message: 'Failed to add item to wardrobe.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}