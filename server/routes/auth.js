import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../index.js';
import { validateRegistrationData, validateLoginData } from '../middleware/validation.js';

const router = express.Router();

// Registration endpoint
router.post('/register', validateRegistrationData, async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  try {
    // Check if user exists
    const existingUser = await new Promise((resolve, reject) => {
      req.db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();

    // Create user
    await new Promise((resolve, reject) => {
      req.db.run(
        'INSERT INTO users (id, email, password, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, email, hashedPassword, firstName, lastName, phone || null],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    // Generate token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        phone,
        isAdmin: false
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Login endpoint
router.post('/login', validateLoginData, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await new Promise((resolve, reject) => {
      req.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isAdmin: Boolean(user.is_admin)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;