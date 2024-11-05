// src/models/User.js

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username.'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email.'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    image: {
      type: String,
      default: '',
    },
    wardrobe: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
        },
      ],
      default: [], // Ensure wardrobe is always an array
    },
    // Add other fields as needed
  },
  { timestamps: true }
);

// Prevent model overwrite upon initial compile
export default mongoose.models.User || mongoose.model('User', UserSchema);