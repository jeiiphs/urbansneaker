import express from 'express';
import cors from 'cors';
import { initializeDatabase, createDbConnection } from './database.js';
import authRoutes from './routes/auth.js';
import sneakersRoutes from './routes/sneakers.js';
import profileRoutes from './routes/profile.js';
import promotionsRoutes from './routes/promotions.js';
import ordersRoutes from './routes/orders.js';

const app = express();
const port = 3000;

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize database
try {
  await initializeDatabase();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Database middleware
app.use(async (req, res, next) => {
  try {
    req.db = await createDbConnection();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sneakers', sneakersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/orders', ordersRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Cleanup middleware
app.use((req, res, next) => {
  if (req.db) {
    req.db.close();
  }
  next();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});