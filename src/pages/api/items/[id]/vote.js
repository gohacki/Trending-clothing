// src/pages/api/items/[id]/vote.js

import { getSession } from "next-auth/react";
import dbConnect from "../../../../lib/mongoose";
import Item from "../../../../models/Item";
import Vote from "../../../../models/Vote";
import { rateLimiter } from "../../../../middleware/rateLimit";
import { runMiddleware } from "../../../../lib/runMiddleware";
import { ensureAnonymousId } from "../../../../middleware/ensureAnonymousId";
import { ensureSessionId } from "../../../../middleware/ensureSessionId";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  // Apply Rate Limiting
  await runMiddleware(req, res, rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  }));

  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
    return;
  }

  try {
    // Connect to database
    await dbConnect();

    // Find the item by ID
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

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
      const anonymousId = await ensureAnonymousId(req, res);
      const sessionId = await ensureSessionId(req, res);
      voteCriteria.anonymousId = anonymousId;
      voteCriteria.sessionId = sessionId;
      // Removed fingerprint usage as it's no longer associated with reCAPTCHA
      // If fingerprinting is still required for other purposes, you can retain it
      // For example:
      // const fingerprint = req.body.fingerprint;
      // voteCriteria.fingerprint = fingerprint;
    }

    // Check if a vote already exists
    const existingVote = await Vote.findOne(voteCriteria);

    if (existingVote) {
      return res.status(400).json({ success: false, message: "You have already voted for this item this week." });
    }

    // Increment the vote count
    item.votes += 1;
    await item.save();

    // Create a new vote record
    await Vote.create(voteCriteria);

    res.status(200).json({ success: true, data: { votes: item.votes }, message: "Vote registered successfully!" });
  } catch (error) {
    console.error("Error voting:", error);
    res.status(500).json({ success: false, message: "An error occurred while processing your vote." });
  }
}

function getWeekNumber(d) {
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
}