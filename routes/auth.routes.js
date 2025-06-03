import { Router } from 'express';
import { requireAuth } from '../app.js';
import { models } from '../public/models/models.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const router = Router();

// Mock database
const users = [
  { 
    id: 1, 
    username: 'admin', 
    password: process.env.PASS,
    role: 'admin'
  }
];

// Login page
router.get('/login', (req, res) => {
  try {
    if (req.cookies.token) {
      return res.redirect('/dashboard');
    }
    res.render('login', { 
      error: null,
      csrfToken: req.csrfToken?.() || '' // Если используете CSRF
    });
  } catch (err) {
    console.error('Login page error:', err);
    res.status(500).render('error', { 
      message: 'Failed to load login page' 
    });
  }
});

// Login handler
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).render('login', {
        error: 'Username and password are required',
        username: username || ''
      });
    }

    // Find user
    const user = users.find(u => 
      u.username === username.trim() && 
      u.password === password
    );

    if (!user) {
      return res.status(401).render('login', {
        error: 'Invalid username or password',
        username: username
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    // Successful login
    console.log(`User ${username} logged in`);
    return res.redirect('/dashboard');

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('login', {
      error: 'Internal server error. Please try again.',
      username: req.body.username || ''
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  try {
    res.clearCookie('token');
    console.log('User logged out');
    res.redirect('/login');
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).redirect('/');
  }
});

// Dashboard
router.get('/dashboard', requireAuth, (req, res) => {
  try {
    res.render('dashboard', {
      user: req.user, // Добавляется в requireAuth middleware
      models: models,
      title: 'Dashboard'
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).render('error', {
      message: 'Failed to load dashboard'
    });
  }
});

// Descriptions page
router.get('/all-descriptions', requireAuth, (req, res) => {
  try {
    res.render('all-descriptions', {
      user: req.user,
      models: models.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description
      })),
      title: 'All Models'
    });
  } catch (err) {
    console.error('Descriptions page error:', err);
    res.status(500).render('error', {
      message: 'Failed to load descriptions'
    });
  }
});

export default router;
