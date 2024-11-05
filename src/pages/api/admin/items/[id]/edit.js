// src/pages/api/admin/items/[id]/edit.js

import dbConnect from '../../../../../../../lib/mongoose';
import Item from '../../../../../../../models/Item';
import { withAdmin } from '../../../../../../../lib/withAdmin';
import { rateLimiter } from '../../../../../../../middleware/rateLimit';
import { runMiddleware } from '../../../../../../../lib/runMiddleware';
import { upload } from '../../../../../../../lib/multerConfig';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false, // Disables Next.js's default body parser
  },
};

async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
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
    const { id } = req.query;
    const { name, description, type, gender, price, style, buyNowLinks } = req.body;
    const file = req.file;

    // Validate input
    if (!name || !description || !type || !gender || !price || !style || !buyNowLinks) {
      return res.status(400).json({ success: false, message: 'All fields except image are required.' });
    }

    // Parse buyNowLinks
    let parsedLinks;
    try {
      parsedLinks = JSON.parse(buyNowLinks);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid Buy Now links format.' });
    }

    if (!Array.isArray(parsedLinks) || parsedLinks.length === 0 || parsedLinks.length > 4) {
      return res.status(400).json({ success: false, message: 'Provide between 1 to 4 Buy Now links.' });
    }

    // Validate each Buy Now link
    for (let i = 0; i < parsedLinks.length; i++) {
      const link = parsedLinks[i];
      if (!link.siteName || !link.url) {
        return res.status(400).json({ success: false, message: `Buy Now link ${i + 1} is incomplete.` });
      }
      // Basic URL validation
      const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})'+ // domain name
        '(\\:\\d+)?(\\/[-a-zA-Z\\d%@_.~+&:]*)*'+ // port and path
        '(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?'+ // query string
        '(\\#[-a-zA-Z\\d_]*)?$','i');
      if (!urlPattern.test(link.url)) {
        return res.status(400).json({ success: false, message: `Invalid URL format in Buy Now link ${i + 1}.` });
      }
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

    // Find the existing item
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    // If a new image is uploaded, handle the upload and delete the old image
    if (file) {
      // Extract the image path from the existing URL
      const imageUrl = item.image;
      const spaceUrl = process.env.NEXT_PUBLIC_DO_CDN_URL; // e.g., https://giveagift-assets.nyc3.cdn.digitaloceanspaces.com
      const imagePath = imageUrl.replace(spaceUrl + '/', ''); // e.g., clothing-app/unique-id.png

      // Delete the old image
      const deleteParams = {
        Bucket: process.env.DO_SPACE_NAME,
        Key: imagePath,
      };
      await s3.send(new DeleteObjectCommand(deleteParams));

      // Upload the new image
      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `clothing-app/${uuidv4()}${fileExtension}`;

      const uploadParams = {
        Bucket: process.env.DO_SPACE_NAME,
        Key: uniqueFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Makes the file publicly readable
      };

      await s3.send(new PutObjectCommand(uploadParams));

      // Update the image URL
      item.image = `${process.env.NEXT_PUBLIC_DO_CDN_URL}/${uniqueFileName}`;
    }

    // Update other fields
    item.name = name;
    item.description = description;
    item.type = type;
    item.gender = gender;
    item.price = price;
    item.style = style;
    item.buyNowLinks = parsedLinks;

    await item.save();

    res.status(200).json({ success: true, data: item, message: 'Item updated successfully.' });
  } catch (error) {
    console.error('Error in admin edit item API:', error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export default withAdmin(handler);