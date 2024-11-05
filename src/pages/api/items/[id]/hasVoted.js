// src/pages/api/items/[id]/hasVoted.js

import { getSession } from "next-auth/react";
import dbConnect from "../../../../lib/mongoose";
import Vote from "../../../../models/Vote";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  try {
    await dbConnect();

    // Get user session
    const session = await getSession({ req });

    // Get user's IP address
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    let voteCriteria = { item: id, week: getWeekNumber(new Date()), ipAddress };

    if (session) {
      // Authenticated user
      voteCriteria.user = session.user.id;
    } else {
      // Unauthenticated user
      // You might need to get anonymousId and fingerprint from cookies or request headers
      const anonymousId = req.cookies.anonymousId;
      const sessionId = req.cookies.sessionId;
      const fingerprint = req.body.fingerprint; // Ensure fingerprint is sent in the request body or headers

      voteCriteria.anonymousId = anonymousId;
      voteCriteria.sessionId = sessionId;
      voteCriteria.fingerprint = fingerprint;
    }

    const existingVote = await Vote.findOne(voteCriteria);

    if (existingVote) {
      return res.status(200).json({ hasVoted: true });
    } else {
      return res.status(200).json({ hasVoted: false });
    }
  } catch (error) {
    console.error('Error checking vote status:', error);
    res.status(500).json({ success: false, message: 'Failed to check vote status.' });
  }
}

function getWeekNumber(d) {
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
}