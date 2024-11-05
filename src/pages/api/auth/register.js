// src/pages/api/auth/register.js

import dbConnect from "../../../lib/mongoose";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import validator from "validator";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
          return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // Check if username exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ success: false, message: "Username already taken." });
        }

        // Check if email exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({ success: false, message: "Email already in use." });
        }

        // Validate email
        if (!validator.isEmail(email)) {
          return res.status(400).json({ success: false, message: "Invalid email format." });
        }

        // Validate username (e.g., alphanumeric and underscores, 3-30 characters)
        if (!validator.isAlphanumeric(username.replace(/_/g, "")) || !validator.isLength(username, { min: 3, max: 30 })) {
          return res.status(400).json({ success: false, message: "Invalid username. Use 3-30 alphanumeric characters or underscores." });
        }

        // Validate password strength
        if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
          return res.status(400).json({ success: false, message: "Password is not strong enough." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
          username,
          email,
          password: hashedPassword,
        });

        res.status(201).json({ success: true, data: user });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}