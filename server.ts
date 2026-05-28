import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { Database } from './server/database.js';

// Resolve directory naming for ES Modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit setup to support potential image/file payload scaling
  app.use(express.json({ limit: '10mb' }));

  // --- API Routes ---

  // Auth: User Registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }
      const user = await Database.registerUser(email, password, name);
      // Simulate simple authentication token (using userId as the simple token)
      return res.status(201).json({
        user,
        token: `token-${user.id}`
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Registration failed.' });
    }
  });

  // Auth: User Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
      const user = await Database.loginUser(email, password);
      return res.json({
        user,
        token: `token-${user.id}`
      });
    } catch (error: any) {
      return res.status(401).json({ error: error.message || 'Login failed.' });
    }
  });

  // Products: Get list of all products
  app.get('/api/products', async (req, res) => {
    try {
      const products = await Database.getProducts();
      return res.json(products);
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to retrieve products.' });
    }
  });

  // Products: Get detailed view of specific product
  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await Database.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      return res.json(product);
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to retrieve product details.' });
    }
  });

  // Orders: Create simple order
  app.post('/api/orders', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer token-')) {
        return res.status(401).json({ error: 'Unauthorized. Please register or login.' });
      }
      const userId = authHeader.replace('Bearer token-', '');
      const { items, shippingAddress, paymentMethod } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Orders must contain at least one item.' });
      }
      if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
        return res.status(400).json({ error: 'Complete shipping address is required.' });
      }

      const order = await Database.createOrder(userId, items, shippingAddress, paymentMethod || 'Credit Card');
      return res.status(201).json(order);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Order processing failed.' });
    }
  });

  // Orders: Fetch historical orders for authenticated user
  app.get('/api/orders', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer token-')) {
        return res.status(401).json({ error: 'Unauthorized. Please register or login.' });
      }
      const userId = authHeader.replace('Bearer token-', '');
      const orders = await Database.getOrdersByUser(userId);
      return res.json(orders);
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to retrieve orders.' });
    }
  });

  // --- Serve Client Front-end ---

  if (process.env.NODE_ENV !== 'production') {
    // In development mode, mount Vite middleware to serve static files and handle fast refreshes
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve pre-built files from dist/ folder
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`E-Commerce application backend listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
