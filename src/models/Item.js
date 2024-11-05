// src/models/Item.js

import mongoose from 'mongoose';

const BuyNowLinkSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: [true, 'Site name is required.'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'URL is required.'],
    trim: true,
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-]*)*\/?$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  }
}, { _id: false }); // Disable _id for subdocuments

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
    buyNowLinks: {
      type: [BuyNowLinkSchema],
      validate: {
        validator: function(v) {
          return v.length <= 4;
        },
        message: 'You can add up to 4 Buy Now links.'
      },
      required: [true, 'Please provide at least one Buy Now link.'],
    },
    votes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // Existing Fields
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