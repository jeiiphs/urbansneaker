import jwt from 'jsonwebtoken';
import { db } from '../index.js';

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    db.get('SELECT id, email, is_admin FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};