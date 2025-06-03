import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import modelRoutes from './routes/models.routes.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET; // В production используйте process.env.JWT_SECRET

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// JWT middleware
export function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    console.log('requireAuth: No token found, redirecting to login.'); // Добавим лог
    return res.redirect('/login');
  }

  try {
    // Убедитесь, что JWT_SECRET здесь тот же, что и при sign
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('requireAuth: Token decoded:', decoded); // Добавим лог
    req.user = decoded; // ИСПРАВЛЕНО: присваиваем весь объект
    next(); // Переходим к следующему middleware/обработчику
  } catch (err) {
    console.error('requireAuth: Error verifying token:', err.message); // Добавим лог ошибки
    // Возможно, токен истек или невалиден
    res.clearCookie('token');
    return res.redirect('/login');
  }
}


// Routes
app.use(authRoutes);
app.use('/models', modelRoutes);

// Basic routes
app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login', { error: null }));

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


export default app;
