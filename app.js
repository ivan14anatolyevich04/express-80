import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import modelRoutes from './routes/models.routes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация Redis с резервным хранилищем в памяти
const setupSessionStore = async () => {
  try {
    const redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.log('Превышено количество попыток подключения к Redis');
            return new Error('Не удалось подключиться к Redis');
          }
          return Math.min(retries * 100, 5000);
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await redisClient.connect();
    console.log('Успешное подключение к Redis');

    return new RedisStore({
      client: redisClient,
      prefix: 'session:',
      ttl: 86400
    });
  } catch (err) {
    console.error('Не удалось подключиться к Redis, используется MemoryStore:', err);
    return null; // Вернет null, и мы будем использовать MemoryStore
  }
};

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Инициализация хранилища сессий
const sessionStore = await setupSessionStore();

app.use(session({
  store: sessionStore || undefined, // Если Redis недоступен, будет использован MemoryStore
  secret: process.env.SESSION_SECRET || 'your_secret_key_here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 86400000
  }
}));

// Остальная конфигурация приложения
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

// Маршруты
app.get('/', (req, res) => {
  res.render('index');
});
app.use(authRoutes); // Основные маршруты авторизации
app.use('/models', modelRoutes); // Маршруты моделей
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


if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(sessionStore ? 
      'Используется RedisStore для сессий' : 
      'Используется MemoryStore для сессий (не для production)');
  })};



export default app;
