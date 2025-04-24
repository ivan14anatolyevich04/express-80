import { Router } from 'express';
import { requireAuth } from '../app.js';
import { models } from '../public/models/models.js';
import jwt from 'jsonwebtoken';

const router = Router();

const users = [
  { id: 1, username: 'admin', password: '12345' }
];

router.get('/login', (req, res) => {
  if (req.cookies.token) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).render('login', { 
        error: 'Username and password are required' 
      });
    }

    const user = users.find(u => 
      u.username === username && 
      u.password === password
    );

    if (!user) {
      return res.status(401).render('login', { 
        error: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { user: { id: user.id, username: user.username } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });

    return res.redirect('/dashboard');

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).render('login', { 
      error: 'Internal server error' 
    });
  }
});

// ... остальные роуты
