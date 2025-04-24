import { Router } from 'express';
import { requireAuth } from '../app.js';
import { models } from '../public/models/models.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs'; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();


  // Проверяем существование файла фона
  

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const model = models.find(m => m.id == req.params.id);
    if (!model) return res.status(404).send('Model not found');

    let backgroundClass = 'background-default'; // Значение по умолчанию

    if (model.background) {
      const backgroundPath = path.join(__dirname, '../public/backgrounds', model.background);
      
      try {
        await fs.access(backgroundPath); // Асинхронная проверка
        backgroundClass = ''; // Файл существует - убираем класс по умолчанию
      } catch (err) {
        // Файл не существует, оставляем backgroundClass как 'background-default'
        console.log(`Background image not found: ${backgroundPath}`);
      }
    }

    res.render('model-view', {
      user: req.session.user,
      model: {
        ...model,
        backgroundClass
      }
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});


export default router;