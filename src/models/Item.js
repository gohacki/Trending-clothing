// src/models/Item.js

import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the item.'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description for the item.'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide an image URL for the item.'],
    },
    links: {
      type: [String],
      required: [true, 'Please provide at least one purchase link.'],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'At least one purchase link is required.',
      },
    },
    votes: {
      type: Number,
      default: 0,
    },
    affiliateLink: {
      type: String,
      // affiliateLink is now optional for user submissions
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent model overwrite upon initial compile
export default mongoose.models.Item || mongoose.model('Item', ItemSchema);