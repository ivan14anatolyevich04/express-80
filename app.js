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

// Настройка сессии
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Шаблонизатор Pug
app.set('views', path.join(__dirname, 'views')); // Устанавливаем директорию для шаблонов
app.set('view engine', 'pug');                   // Используем движок шаблонов Pug

// Статические файлы
app.use(express.static(path.join(__dirname, 'public'))); // Подключаем публичные статичные файлы

// Маршруты
app.use(authRoutes);           // Авторизация
app.use('/models', modelRoutes); // Модели

// Обработка корневого маршрута '/'
app.get('/', (req, res) => {
  if (req.session.user) {
    res.render('index');       // Отображаем главную страницу
  } else {
    res.redirect('/login');    // Перенаправление на вход, если не авторизирован
  }
});

// Функция проверки авторизации
export function requireAuth(req, res, next) {
  if (req.session.user) {
    return next();             // Продолжение обработки запросов, если авторизованы
  }
  res.redirect('/login');      // Иначе перенаправляем на страницу входа
}

// Экспортируем объект приложения
export default app;