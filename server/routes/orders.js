import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create order
router.post('/', authenticateToken, async (req, res) => {
  const { items, total, shippingAddress } = req.body;
  const userId = req.user.id;

  try {
    // Start transaction
    await req.db.run('BEGIN TRANSACTION');

    // Create order
    const orderResult = await new Promise((resolve, reject) => {
      req.db.run(
        'INSERT INTO orders (id, user_id, total, status, shipping_address) VALUES (?, ?, ?, ?, ?)',
        [Date.now().toString(), userId, total, 'pending', JSON.stringify(shippingAddress)],
        function(err) {
          if (err) reject(err);
          resolve(this);
        }
      );
    });

    // Add order items
    for (const item of items) {
      await new Promise((resolve, reject) => {
        req.db.run(
          'INSERT INTO order_items (order_id, sneaker_id, quantity, size, price) VALUES (?, ?, ?, ?, ?)',
          [orderResult.lastID, item.sneakerId, item.quantity, item.size, item.price],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      // Update stock
      await new Promise((resolve, reject) => {
        req.db.run(
          'UPDATE sneakers SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.sneakerId],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });
    }

    // Commit transaction
    await req.db.run('COMMIT');

    res.status(201).json({ message: 'Order created successfully' });
  } catch (error) {
    // Rollback on error
    await req.db.run('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await new Promise((resolve, reject) => {
      req.db.all(
        `SELECT o.*, oi.sneaker_id, oi.quantity, oi.size, oi.price
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.user_id = ?
         ORDER BY o.created_at DESC`,
        [req.user.id],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });

    // Group order items
    const groupedOrders = orders.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          userId: row.user_id,
          total: row.total,
          status: row.status,
          createdAt: row.created_at,
          shippingAddress: JSON.parse(row.shipping_address),
          items: []
        };
      }

      if (row.sneaker_id) {
        acc[row.id].items.push({
          sneakerId: row.sneaker_id,
          quantity: row.quantity,
          size: row.size,
          price: row.price
        });
      }

      return acc;
    }, {});

    res.json(Object.values(groupedOrders));
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;