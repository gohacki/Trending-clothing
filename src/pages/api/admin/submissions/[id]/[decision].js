// src/pages/api/admin/submissions/[id]/[decision].js

import dbConnect from '../../../../../../lib/mongoose';
import Item from '../../../../../../models/Item';
import { withAdmin } from '../../../../../../lib/withAdmin';
import { rateLimiter } from '../../../../../../middleware/rateLimit';
import { runMiddleware } from '../../../../../../lib/runMiddleware';

export default withAdmin(async function handler(req, res) {
  const { id, decision } = req.query;

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

  // Decision Validation
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ success: false, message: 'Invalid decision.' });
  }

  try {
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    if (item.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Item is already ${item.status}.` });
    }

    if (decision === 'approve') {
      const { buyNowLinks, type, gender, price, style } = req.body;

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

      // Validate enumerated fields
      const validTypes = ['Shirt', 'Pants', 'Jacket', 'Dress', 'Shoes', 'Accessories'];
      const validGenders = ['Male', 'Female', 'Unisex'];
      const validPrices = ['Under $50', '$50-$100', 'Over $100'];
      const validStyles = ['Casual', 'Formal', 'Sport', 'Vintage', 'Streetwear'];

      if (!validTypes.includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid type of clothing.' });
      }

      if (!validGenders.includes(gender)) {
        return res.status(400).json({ success: false, message: 'Invalid gender.' });
      }

      if (!validPrices.includes(price)) {
        return res.status(400).json({ success: false, message: 'Invalid price range.' });
      }

      if (!validStyles.includes(style)) {
        return res.status(400).json({ success: false, message: 'Invalid style.' });
      }

      // Update item fields
      item.buyNowLinks = parsedLinks;
      item.type = type;
      item.gender = gender;
      item.price = price;
      item.style = style;
      item.status = 'approved';
    } else if (decision === 'reject') {
      item.status = 'rejected';
    }

    await item.save();

    return res.status(200).json({ success: true, message: `Item ${decision}d successfully.` });
  } catch (error) {
    console.error('Error updating item status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update item status.' });
  }
});