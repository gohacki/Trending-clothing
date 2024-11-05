// src/pages/api/admin/items/[id]/remove.js

import dbConnect from '../../../../../lib/mongoose';
import Item from '../../../../../models/Item';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { rateLimiter } from '../../../../../middleware/rateLimit';
import { runMiddleware } from '../../../../../lib/runMiddleware';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

export default async function handler(req, res) {
  // Apply Rate Limiting
  await runMiddleware(req, res, rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  }));

  const { id } = req.query;

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    return;
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (session.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Forbidden: Admins only.' });
      return;
    }

    // Connect to MongoDB
    await dbConnect();

    // Find the item by ID
    const item = await Item.findById(id);

    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found.' });
      return;
    }

    // Extract the image path from the URL
    const imageUrl = item.image;
    const spaceUrl = process.env.NEXT_PUBLIC_DO_CDN_URL; // e.g., https://giveagift-assets.nyc3.cdn.digitaloceanspaces.com
    const imagePath = imageUrl.replace(spaceUrl + '/', ''); // e.g., clothing-app/unique-id.png

    // Initialize S3 client for DigitalOcean Spaces
    const s3 = new S3Client({
      region: process.env.DO_SPACE_REGION,
      endpoint: process.env.DO_SPACE_ENDPOINT, // e.g., https://nyc3.digitaloceanspaces.com
      credentials: {
        accessKeyId: process.env.DO_SPACE_ACCESS_KEY_ID,
        secretAccessKey: process.env.DO_SPACE_SECRET_ACCESS_KEY,
      },
    });

    // Delete the image from DigitalOcean Space
    const deleteParams = {
      Bucket: process.env.DO_SPACE_NAME,
      Key: imagePath,
    };

    await s3.send(new DeleteObjectCommand(deleteParams));

    // Remove the item from the database
    await Item.deleteOne({ _id: id });

    res.status(200).json({ success: true, message: 'Item removed successfully.' });
  } catch (error) {
    console.error('Error in admin remove item API:', error);
    res.status(400).json({ success: false, message: error.message });
  }
}