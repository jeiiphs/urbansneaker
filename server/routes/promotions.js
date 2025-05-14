import express from 'express';

const router = express.Router();

// Get all promotions
router.get('/', (req, res) => {
  req.db.all(
    `SELECT 
      id,
      title,
      description,
      discount_percentage,
      valid_until,
      image_url,
      created_at
    FROM promotions 
    WHERE valid_until >= date('now')
    ORDER BY created_at DESC`,
    (err, promotions) => {
      if (err) {
        console.error('Error fetching promotions:', err);
        return res.status(500).json({ error: 'Error fetching promotions' });
      }
      res.json(promotions);
    }
  );
});

export default router;
