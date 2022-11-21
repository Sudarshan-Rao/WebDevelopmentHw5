import { Router } from 'express';
import {
  getImagesHandler,
  uploadImageHandler,
} from './handlers/images';

const router = Router();

router.get('/', (req, res) => {
  console.log('Hello from router');
  res.status(200);
  res.json({ message: 'Hello from router' });
});

// route to display all images
router.get('/images', getImagesHandler);

// route to upload an image
router.post('/images', uploadImageHandler);

router.use((err, req, res, next) => {
  if (err.type === 'auth') {
    console.log(`Error: ${err.message}`);
    res.status(401);
    res.json({ message: `Error: ${err.message}` });
  } else {
    res.status(500);
    res.json({ message: `Server Error: ${err.message}` });
  }
});

export default router;
