import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export async function getUnitsByLangAndLevel(req: Request, res: Response): Promise<void> {
  const langCode = String(req.params.langCode);
  const levelCode = String(req.params.levelCode);

  const language = await prisma.language.findUnique({ where: { code: langCode } });
  if (!language) throw new NotFoundError('Language');

  const level = await prisma.cefrLevel.findUnique({ where: { code: levelCode } });
  if (!level) throw new NotFoundError('Level');

  const units = await prisma.unit.findMany({
    where: { languageId: language.id, levelId: level.id },
    include: {
      lessons: {
        where: { isPublished: true },
        orderBy: { orderIndex: 'asc' },
        select: { id: true, title: true, category: true, xpReward: true, orderIndex: true, tags: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  res.json({ success: true, data: units });
}

export async function getLessonsByUnit(req: Request, res: Response): Promise<void> {
  const unitId = String(req.params.unitId);

  const lessons = await prisma.lesson.findMany({
    where: { unitId, isPublished: true },
    orderBy: { orderIndex: 'asc' },
  });

  res.json({ success: true, data: lessons });
}

export async function getLessonById(req: Request, res: Response): Promise<void> {
  const lessonId = String(req.params.lessonId);

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      language: { select: { code: true, name: true, direction: true } },
      level: { select: { code: true, title: true } },
      unit: { select: { code: true, title: true } },
      exercises: {
        where: { isPublished: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!lesson) throw new NotFoundError('Lesson');

  res.json({ success: true, data: lesson });
}

export async function createLesson(req: Request, res: Response): Promise<void> {
  const unitId = String(req.params.unitId);

  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit) throw new NotFoundError('Unit');

  const lesson = await prisma.lesson.create({
    data: {
      ...req.body,
      unitId,
      languageId: unit.languageId,
      levelId: unit.levelId,
    },
  });

  res.status(201).json({ success: true, data: lesson });
}

export async function getExercisesByLesson(req: Request, res: Response): Promise<void> {
  const lessonId = String(req.params.lessonId);

  const exercises = await prisma.exercise.findMany({
    where: { lessonId, isPublished: true },
    orderBy: { sortOrder: 'asc' },
  });

  res.json({ success: true, data: exercises });
}

export async function createExercise(req: Request, res: Response): Promise<void> {
  const lessonId = String(req.params.lessonId);

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new NotFoundError('Lesson');

  const exercise = await prisma.exercise.create({
    data: { ...req.body, lessonId },
  });

  res.status(201).json({ success: true, data: exercise });
}
