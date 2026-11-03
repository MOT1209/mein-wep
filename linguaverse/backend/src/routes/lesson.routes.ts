import { Router } from 'express';
import {
  getUnitsByLangAndLevel,
  getLessonsByUnit,
  getLessonById,
  createLesson,
  getExercisesByLesson,
  createExercise,
} from '../controllers/lesson.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createLessonSchema, createExerciseSchema } from '../validators/lesson.validator';

const router = Router();

// Units by language + level
router.get('/languages/:langCode/levels/:levelCode/units', getUnitsByLangAndLevel);

// Lessons by unit
router.get('/units/:unitId/lessons', getLessonsByUnit);

// Single lesson with exercises
router.get('/lessons/:lessonId', getLessonById);

// Create lesson
router.post('/units/:unitId/lessons', authenticate, validate(createLessonSchema), createLesson);

// Exercises by lesson
router.get('/lessons/:lessonId/exercises', getExercisesByLesson);

// Create exercise
router.post('/lessons/:lessonId/exercises', authenticate, validate(createExerciseSchema), createExercise);

export default router;
