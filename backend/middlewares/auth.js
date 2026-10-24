import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

const getJwtSecret = () => process.env.JWT_SECRET || 'kar_zone_super_secure_jwt_secret_key_2026';

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token missing'
    })
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, getJwtSecret());

    // Check if it's a dedicated admin token
    if (payload.role === 'admin') {
      req.user = {
        _id: payload.id || 'admin_root',
        id: payload.id || 'admin_root',
        name: 'Administrator',
        email: payload.email || 'admin@rydex.com',
        role: 'admin'
      };
      return next();
    }

    if (payload.id) {
      const user = await User.findById(payload.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      req.user = user;
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token payload'
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token missing, invalid or expired'
    });
  }
}

export function adminOnly(req, res, next) {
  authMiddleware(req, res, () => {
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.email === (process.env.ADMIN_EMAIL || 'admin@rydex.com').toLowerCase());
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required'
      });
    }
    next();
  });
}