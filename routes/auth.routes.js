import { Router } from 'express';
import { requireAuth } from '../app.js';
import { models } from '../public/models/models.js';
const router = Router();

// Временная "база данных" пользователей
const users = [
  { id: 1, username: 'admin', password: '12345' }
];

// Маршрут для страницы входа
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// Обработка входа
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    req.session.user = user;
    return res.redirect('/dashboard');
  }

  res.render('login', { error: 'Invalid username or password' });
});

// Выход из системы
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.redirect('/login');
  });
});

// Dashboard (главная страница после входа)
router.get('/dashboard', requireAuth, (req, res) => {
  
  res.render('dashboard', {
    user: req.session.user,
    models: models
  });
});
router.get('/all-descriptions', requireAuth, (req, res) => {
  res.render('all-descriptions', {
    user: req.session.user,
    models: models.map(model => ({
      id: model.id,
      name: model.name,
      description: model.description
    }))
  });
});

export default router;