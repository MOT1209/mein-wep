import { Router } from 'express';
import {
  getVocabularyByLanguage,
  createVocabulary,
  getFlashcardsByLanguage,
  createFlashcard,
} from '../controllers/vocabulary.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createVocabularySchema, createFlashcardSchema } from '../validators/vocabulary.validator';

const router = Router();

router.get('/languages/:langCode/vocabulary', getVocabularyByLanguage);
router.post('/languages/:langCode/vocabulary', authenticate, validate(createVocabularySchema), createVocabulary);

router.get('/languages/:langCode/flashcards', getFlashcardsByLanguage);
router.post('/languages/:langCode/flashcards', authenticate, validate(createFlashcardSchema), createFlashcard);

export default router;
