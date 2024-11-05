// src/pages/api/items/submit.js

import dbConnect from '../../../lib/mongoose';
import Item from '../../../models/Item';
import { getSession } from 'next-auth/react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { rateLimiter } from '../../../middleware/rateLimit';
import { runMiddleware } from '../../../lib/runMiddleware';
import { upload } from '../../../lib/multerConfig';

export const config = {
  api: {
    bodyParser: false, // Disables Next.js's default body parser
  },
};

export default async function handler(req, res) {
  // Apply Rate Limiting
  await runMiddleware(req, res, rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  }));

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    return;
  }

  // Apply Multer Middleware
  await runMiddleware(req, res, upload.single('image'));

  try {
    // Connect to MongoDB
    await dbConnect();

    // Get user session
    const session = await getSession({ req });

    if (!session) {
      res.status(401).json({ success: false, message: 'You must be signed in to submit items.' });
      return;
    }

    const { name, description, links } = req.body;
    const file = req.file;

    // Validate input
    if (!name || !description || !links || !file) {
      res.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    // Parse links (assuming comma-separated)
    const linksArray = links.split(',').map(link => link.trim()).filter(link => link);

    if (linksArray.length === 0) {
      res.status(400).json({ success: false, message: 'At least one purchase link is required.' });
      return;
    }

    // Initialize S3 client for DigitalOcean Spaces
    const s3 = new S3Client({
      region: process.env.DO_SPACE_REGION,
      endpoint: process.env.DO_SPACE_ENDPOINT, // e.g., https://nyc3.digitaloceanspaces.com
      credentials: {
        accessKeyId: process.env.DO_SPACE_ACCESS_KEY_ID,
        secretAccessKey: process.env.DO_SPACE_SECRET_ACCESS_KEY,
      },
    });

    // Generate a unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `clothing-app/${uuidv4()}${fileExtension}`;

    // Upload to DigitalOcean Space
    const uploadParams = {
      Bucket: process.env.DO_SPACE_NAME,
      Key: uniqueFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Makes the file publicly readable
    };

    await s3.send(new PutObjectCommand(uploadParams));

    // Construct the CDN URL
    const imageUrl = `${process.env.NEXT_PUBLIC_DO_CDN_URL}/${uniqueFileName}`;

    // Create new item with status 'pending' and without affiliateLink
    const newItem = await Item.create({
      name,
      description,
      image: imageUrl,
      links: linksArray,
      // affiliateLink is omitted; admin will add it upon approval
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: newItem,
      message: 'Item submitted successfully and is pending approval.',
    });
  } catch (error) {
    console.error('Error in submit API:', error);
    res.status(400).json({ success: false, message: error.message });
  }
}