
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import modelRoutes from './routes/models.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());                      // JSON parser
app.use(express.urlencoded({ extended: true })); // Body parser for forms

// Session setup
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// Template engine configuration
app.set('views', path.join(__dirname, 'views')); // View directory
app.set('view engine', 'pug');                  // Using Pug as template engine

// Static files
app.use(express.static(path.join(__dirname, 'public'))); // Serve static assets

// Routes
app.use(authRoutes);                           // Authorization-related routes
app.use('/models', modelRoutes);              // Model-specific routes

// Root route ('/')
app.get('/', (req, res) => {
  res.render('index');                         // Render the home page without any authentication check
});

// Route to '/login'
app.get('/login', (req, res) => {
  res.render('login');                         // Show login page
});

// Protected dashboard route with authorization check
app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard');                     // Accessible only when logged in
});

// Function to verify user is authenticated
export function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');             // Redirect unauthenticated users to login
  }
  next();                                      // Allow access for authorized users
}

// Start server for development purposes
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

// Exporting application object
export default app;
