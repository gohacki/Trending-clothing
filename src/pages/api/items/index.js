// src/pages/api/items/index.js

import dbConnect from '../../../lib/mongoose';
import Item from '../../../models/Item';

export default async function handler(req, res) {
  const { method, query } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const { status, type, gender, price, style } = query;

        // Build the filter object
        let filter = {};

        if (status) {
          filter.status = status;
        }

        if (type) {
          filter.type = type;
        }

        if (gender) {
          filter.gender = gender;
        }

        if (price) {
          filter.price = price;
        }

        if (style) {
          filter.style = style;
        }

        const items = await Item.find(filter).sort({ votes: -1 }).lean();
        res.status(200).json({ success: true, data: items });
      } catch (error) {
        console.error('Error fetching items:', error);
        res.status(400).json({ success: false, message: 'Failed to fetch items.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}