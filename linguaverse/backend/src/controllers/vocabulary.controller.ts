import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export async function getVocabularyByLanguage(req: Request, res: Response): Promise<void> {
  const langCode = String(req.params.langCode);
  const language = await prisma.language.findUnique({ where: { code: langCode } });
  if (!language) throw new NotFoundError('Language');

  const { category } = req.query;

  const where: any = { languageId: language.id };
  if (category && typeof category === 'string') {
    where.category = category;
  }

  const vocabulary = await prisma.vocabulary.findMany({
    where,
    orderBy: { word: 'asc' },
  });

  res.json({ success: true, data: vocabulary });
}

export async function createVocabulary(req: Request, res: Response): Promise<void> {
  const langCode = String(req.params.langCode);
  const language = await prisma.language.findUnique({ where: { code: langCode } });
  if (!language) throw new NotFoundError('Language');

  const vocabulary = await prisma.vocabulary.create({
    data: { ...req.body, languageId: language.id },
  });

  res.status(201).json({ success: true, data: vocabulary });
}

export async function getFlashcardsByLanguage(req: Request, res: Response): Promise<void> {
  const langCode = String(req.params.langCode);
  const language = await prisma.language.findUnique({ where: { code: langCode } });
  if (!language) throw new NotFoundError('Language');

  const flashcards = await prisma.flashcard.findMany({
    where: { languageId: language.id, isMastered: false },
    orderBy: { nextReviewAt: 'asc' },
  });

  res.json({ success: true, data: flashcards });
}

export async function createFlashcard(req: Request, res: Response): Promise<void> {
  const langCode = String(req.params.langCode);
  const language = await prisma.language.findUnique({ where: { code: langCode } });
  if (!language) throw new NotFoundError('Language');

  const flashcard = await prisma.flashcard.create({
    data: { ...req.body, languageId: language.id },
  });

  res.status(201).json({ success: true, data: flashcard });
}
