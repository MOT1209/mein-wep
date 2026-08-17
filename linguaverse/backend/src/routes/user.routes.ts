import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  addLanguage,
  getMyLanguages,
  updateLessonProgress,
  getMyProgress,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', updateProfile);

router.get('/me/languages', getMyLanguages);
router.post('/me/languages', addLanguage);

router.get('/me/progress', getMyProgress);
router.post('/me/progress/lessons/:lessonId', updateLessonProgress);

export default router;
