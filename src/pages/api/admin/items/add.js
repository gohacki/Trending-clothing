// src/pages/api/admin/items/add.js

import dbConnect from '../../../../lib/mongoose';
import Item from '../../../../models/Item';
import { withAdmin } from '../../../../lib/withAdmin';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { rateLimiter } from '../../../../middleware/rateLimit';
import { runMiddleware } from '../../../../lib/runMiddleware';
import { upload } from '../../../../lib/multerConfig';

export const config = {
  api: {
    bodyParser: false, // Disables Next.js's default body parser
  },
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  // Apply Rate Limiting
  await runMiddleware(req, res, rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  }));

  // Apply Multer Middleware
  await runMiddleware(req, res, upload.single('image'));

  try {
    const { name, description, affiliateLink, links } = req.body;
    const file = req.file;

    // Validate input
    if (!name || !description || !affiliateLink || !links || !file) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Parse links (assuming comma-separated)
    const linksArray = links.split(',').map(link => link.trim()).filter(link => link);

    if (linksArray.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one purchase link is required.' });
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

    // Create new item with status 'approved' since admin is adding it directly
    const newItem = await Item.create({
      name,
      description,
      image: imageUrl,
      links: linksArray,
      affiliateLink,
      status: 'approved',
    });

    return res.status(201).json({
      success: true,
      data: newItem,
      message: 'Item added successfully!',
    });
  } catch (error) {
    console.error('Error in admin add item API:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

export default withAdmin(handler);