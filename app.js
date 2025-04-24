import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import modelRoutes from './routes/models.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройки сессии
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Шаблонизатор Pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Маршруты
app.use(authRoutes); // Основные маршруты авторизации
app.use('/models', modelRoutes); // Маршруты моделей

// Корневой маршрут
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Экспорт функции проверки авторизации
export function requireAuth(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});