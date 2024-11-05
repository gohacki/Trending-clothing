// src/models/Vote.js

import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Optional: Only for authenticated users
    },
    anonymousId: {
      type: String,
      // Optional: Only for unauthenticated users
    },
    sessionId: {
      type: String,
      // Optional: For session tracking
    },
    fingerprint: {
      type: String,
      // Optional: For device fingerprinting
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    week: {
      type: Number,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Unique index for authenticated users
VoteSchema.index({ user: 1, week: 1, item: 1 }, { unique: true, sparse: true });

// Unique index for anonymous users based on anonymousId, week, and item
VoteSchema.index({ anonymousId: 1, week: 1, item: 1 }, { unique: true, sparse: true });

// Unique index for IP address per item per week
VoteSchema.index({ ipAddress: 1, week: 1, item: 1 }, { unique: true, sparse: true });

// Unique index for fingerprint per item per week
VoteSchema.index({ fingerprint: 1, week: 1, item: 1 }, { unique: true, sparse: true });

export default mongoose.models.Vote || mongoose.model("Vote", VoteSchema);