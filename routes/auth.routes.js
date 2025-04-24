import { Router } from 'express';
import { requireAuth} from '../app.js';
import { models } from '../public/models/models.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
// Временная "база данных" пользователей
const users = [
  { id: 1, username: 'admin', password: '12345' }
];

// Маршрут для страницы входа
router.get('/login', (req, res) => {
  if (req.cookies.token) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// Обработка входа
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: '1h' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 час
    });
    
    return res.redirect('/dashboard');
  }

  res.render('login', { error: 'Invalid username or password' });
});

// Выход из системы
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Dashboard
router.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', {
    user: req.user,
    models: models
  });
});

router.get('/all-descriptions', requireAuth, (req, res) => {
  res.render('all-descriptions', {
    user: req.user,
    models: models.map(model => ({
      id: model.id,
      name: model.name,
      description: model.description
    }))
  });
});

export default router;
