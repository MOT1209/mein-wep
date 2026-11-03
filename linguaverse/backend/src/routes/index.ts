import { Router } from 'express';
import authRoutes from './auth.routes';
import languageRoutes from './language.routes';
import lessonRoutes from './lesson.routes';
import vocabularyRoutes from './vocabulary.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/languages', languageRoutes);
router.use('/', lessonRoutes);          // Units, lessons, exercises
router.use('/', vocabularyRoutes);      // Vocabulary, flashcards
router.use('/users', userRoutes);       // Profile, progress

export default router;
