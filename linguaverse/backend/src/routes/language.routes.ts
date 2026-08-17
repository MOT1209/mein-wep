import { Router } from 'express';
import {
  getAllLanguages,
  getLanguageByCode,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  getLanguageLevels,
} from '../controllers/language.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createLanguageSchema } from '../validators/lesson.validator';

const router = Router();

router.get('/', getAllLanguages);
router.get('/:code', getLanguageByCode);
router.get('/:code/levels', getLanguageLevels);
router.post('/', authenticate, validate(createLanguageSchema), createLanguage);
router.put('/:code', authenticate, updateLanguage);
router.delete('/:code', authenticate, deleteLanguage);

export default router;
