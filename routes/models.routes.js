import { Router } from 'express';
import { requireAuth } from '../app.js';
import { models } from '../public/models/models.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Middleware для проверки доступности фона
const checkBackground = async (req, res, next) => {
  try {
    const model = models.find(m => m.id == req.params.id);
    if (!model) {
      return res.status(404).render('error', {
        message: 'Model not found',
        user: req.user
      });
    }

    req.modelData = {
      ...model,
      backgroundClass: 'background-default'
    };

    if (model.background) {
      const backgroundPath = path.join(
        __dirname, 
        '../public/backgrounds', 
        model.background
      );
      
      try {
        await fs.access(backgroundPath);
        req.modelData.backgroundClass = '';
      } catch (err) {
        console.log(`Background image not found: ${backgroundPath}`);
      }
    }

    next();
  } catch (error) {
    console.error('Background check error:', error);
    res.status(500).render('error', {
      message: 'Error processing background',
      user: req.user
    });
  }
};

// Просмотр конкретной модели
router.get('/:id', requireAuth, checkBackground, async (req, res) => {
  try {
    res.render('model-view', {
      user: req.user, // Извлекается из JWT в requireAuth
      model: req.modelData,
      title: `${req.modelData.name} - Model Viewer`
    });
  } catch (error) {
    console.error('Model view error:', error);
    res.status(500).render('error', {
      message: 'Failed to load model',
      user: req.user
    });
  }
});

// Список всех моделей (если нужен)
router.get('/', requireAuth, (req, res) => {
  try {
    res.render('models-list', {
      user: req.user,
      models: models.map(model => ({
        id: model.id,
        name: model.name,
        thumbnail: model.thumbnail
      })),
      title: 'All Models'
    });
  } catch (error) {
    console.error('Models list error:', error);
    res.status(500).render('error', {
      message: 'Failed to load models list',
      user: req.user
    });
  }
});

export default router;
