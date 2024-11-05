// src/pages/api/items/index.js

import dbConnect from '../../../lib/mongoose';
import Item from '../../../models/Item';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const items = await Item.find({ status: 'approved' }).sort({ votes: -1 });
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