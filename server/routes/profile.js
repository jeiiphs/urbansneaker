import express from 'express';
import { db } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, email, first_name, last_name, phone, is_admin FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isAdmin: Boolean(user.is_admin)
      });
    }
  );
});

router.put('/', authenticateToken, (req, res) => {
  const { firstName, lastName, phone } = req.body;

  db.run(
    'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
    [firstName, lastName, phone, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error updating profile' });
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

export default router;