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
      const { affiliateLink } = req.body;

      if (!affiliateLink) {
        return res.status(400).json({ success: false, message: 'Affiliate link is required to approve the item.' });
      }

      // Validate affiliateLink (basic URL validation)
      const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})'+ // domain name
        '(\\:\\d+)?(\\/[-a-zA-Z\\d%@_.~+&:]*)*'+ // port and path
        '(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?'+ // query string
        '(\\#[-a-zA-Z\\d_]*)?$','i');
      
      if (!urlPattern.test(affiliateLink)) {
        return res.status(400).json({ success: false, message: 'Invalid affiliate link URL.' });
      }

      item.affiliateLink = affiliateLink;
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