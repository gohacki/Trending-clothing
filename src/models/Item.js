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
    // **New Fields**
    type: {
      type: String,
      enum: ['Shirt', 'Pants', 'Jacket', 'Dress', 'Shoes', 'Accessories'],
      required: [true, 'Please specify the type of clothing.'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Unisex'],
      required: [true, 'Please specify the gender.'],
    },
    price: {
      type: String,
      enum: ['Under $50', '$50-$100', 'Over $100'],
      required: [true, 'Please specify the price range.'],
    },
    style: {
      type: String,
      enum: ['Casual', 'Formal', 'Sport', 'Vintage', 'Streetwear'],
      required: [true, 'Please specify the style.'],
    },
  },
  { timestamps: true }
);

// Prevent model overwrite upon initial compile
export default mongoose.models.Item || mongoose.model('Item', ItemSchema);