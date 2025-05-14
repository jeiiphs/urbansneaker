import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all sneakers
router.get('/', async (req, res) => {
  try {
    const sneakers = await new Promise((resolve, reject) => {
      req.db.all('SELECT * FROM sneakers', [], (err, rows) => {
        if (err) reject(err);
        resolve(rows || []);
      });
    });

    // If no sneakers found, return sample data
    if (sneakers.length === 0) {
      return res.json([{
        id: 1,
        name: "Air Max 270",
        brand: "Nike",
        price: 149.99,
        image_url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80",
        description: "The Nike Air Max 270 delivers visible cushioning under every step.",
        stock: 10,
        style: "Lifestyle",
        sizes: ["38", "39", "40", "41", "42", "43", "44"]
      }]);
    }

    const processedSneakers = sneakers.map(sneaker => ({
      ...sneaker,
      sizes: typeof sneaker.sizes === 'string' ? JSON.parse(sneaker.sizes) : sneaker.sizes || []
    }));

    res.json(processedSneakers);
  } catch (error) {
    console.error('Error fetching sneakers:', error);
    res.status(500).json({ error: 'Error fetching sneakers' });
  }
});

// Add new sneaker (admin only)
router.post('/', authenticateToken, async (req, res) => {
  const { name, brand, price, image_url, description, stock, style, sizes } = req.body;
  
  try {
    const result = await new Promise((resolve, reject) => {
      req.db.run(
        'INSERT INTO sneakers (name, brand, price, image_url, description, stock, style, sizes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, brand, price, image_url, description, stock, style, JSON.stringify(sizes)],
        function(err) {
          if (err) reject(err);
          resolve(this);
        }
      );
    });
    res.status(201).json({ id: result.lastID });
  } catch (error) {
    console.error('Error creating sneaker:', error);
    res.status(500).json({ error: 'Error creating sneaker' });
  }
});

export default router;