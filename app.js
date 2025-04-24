import express from 'express';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import modelRoutes from './routes/models.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

await redisClient.connect().catch(console.error);

// Initialize Redis session store
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'session:',
  ttl: 86400 // Session TTL in seconds (1 day)
});

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with Redis
app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || 'your_strong_secret_key_here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set to true in production if using HTTPS
    httpOnly: true,
    maxAge: 86400000, // 1 day in milliseconds
    sameSite: 'lax'
  }
}));

// Template engine configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use(authRoutes);
app.use('/models', modelRoutes);

// Root route
app.get('/', (req, res) => {
  res.render('index');
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

// Protected dashboard route
app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard');
});

// Authentication middleware
export function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Start server (for development)
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisClient.quit();
  process.exit();
});

export default app;
