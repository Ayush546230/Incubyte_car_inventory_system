import mongoose from "mongoose";
import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const TOKEN_EXPIRES_IN = "24h";
const getJwtSecret = () => process.env.JWT_SECRET || "kar_zone_super_secure_jwt_secret_key_2026";

const createToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), { expiresIn: TOKEN_EXPIRES_IN });
};


export async function register(req, res) {
  try {
    // Step 1: Extract and sanitize user registration fields
    const name = String(req.body.name || "").trim();
    const emailRaw = String(req.body.email || "").trim();
    const email = validator.normalizeEmail(emailRaw) || emailRaw.toLowerCase();
    const password = String(req.body.password || "");

    // Validation 1: Ensure name, email, and password are all present
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Validation 2: Verify email has valid email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    // Validation 3: Enforce minimum password length of 8 characters for security
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be atleast 8 characters.",
      });
    }

    // Validation 4: Check if an account already exists with this email
    const exists = await User.findOne({ email }).lean();
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Step 2: Hash the password with bcrypt salt rounds for secure storage
    const newId = new mongoose.Types.ObjectId();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 3: Create and save user document
    const user = new User({
      _id: newId,
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    // Step 4: Issue a 24-hour JWT auth token so user is automatically logged in upon signup
    const token = createToken(newId.toString());

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register error", err);
    // Handle MongoDB unique index violation duplicate key error
    if (err.code === 11000)
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

export async function login(req, res) {
  try {
    // Step 1: Extract and normalize customer login credentials
    const emailRaw = String(req.body.email || "").trim();
    const email = validator.normalizeEmail(emailRaw) || emailRaw.toLowerCase();
    const password = String(req.body.password || "");

    // Validation: Require both email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Step 2: Find user by email in database
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

    // Step 3: Compare plain text password against bcrypt hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

    // Step 4: Issue 24-hour JWT token upon successful authentication
    const token = createToken(user._id.toString());
    return res.status(200).json({
      success: true,
      message: 'Login Successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

export async function adminLogin(req, res) {
  try {
    // Step 1: Extract and normalize admin credentials
    const emailRaw = String(req.body.email || "").trim();
    const email = validator.normalizeEmail(emailRaw) || emailRaw.toLowerCase();
    const password = String(req.body.password || "");

    // Validation: Require both email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Step 2: Retrieve system admin credentials from .env
    const defaultAdminEmail = (process.env.ADMIN_EMAIL || "admin@rydex.com").toLowerCase();
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || "admin123";

    let isAdminValid = false;
    let adminName = "RYDEX Administrator";

    // Step 3: First check if matching the master environment admin credentials
    if (email === defaultAdminEmail && password === defaultAdminPassword) {
      isAdminValid = true;
    } else {
      // Step 4: Otherwise check if matching a database user with role: 'admin'
      const user = await User.findOne({ email });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch && (user.role === "admin" || email === defaultAdminEmail)) {
          isAdminValid = true;
          adminName = user.name || adminName;
        }
      }
    }

    // If credentials did not match either source, reject with 401 Unauthorized
    if (!isAdminValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    // Step 5: Issue a dedicated admin JWT token with role: 'admin' claim
    const token = jwt.sign({ role: "admin", email }, getJwtSecret(), { expiresIn: "24h" });

    return res.status(200).json({
      success: true,
      message: "Admin Login Successful! Welcome Administrator",
      token,
      role: "admin",
      user: {
        name: adminName,
        email,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("Admin login error", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

/**
 * Returns current authenticated user profile for session validation.
 */
export async function getProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

