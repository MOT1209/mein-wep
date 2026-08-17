import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export async function getAllLanguages(_req: Request, res: Response): Promise<void> {
  const languages = await prisma.language.findMany({
    where: { status: 'active' },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, data: languages });
}

export async function getLanguageByCode(req: Request, res: Response): Promise<void> {
  const code = String(req.params.code);
  const language = await prisma.language.findUnique({
    where: { code },
    include: {
      units: {
        include: {
          level: true,
          lessons: {
            where: { isPublished: true },
            orderBy: { orderIndex: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!language) {
    throw new NotFoundError('Language');
  }

  res.json({ success: true, data: language });
}

export async function createLanguage(req: Request, res: Response): Promise<void> {
  const language = await prisma.language.create({ data: req.body });

  res.status(201).json({ success: true, data: language });
}

export async function updateLanguage(req: Request, res: Response): Promise<void> {
  const code = String(req.params.code);
  const language = await prisma.language.update({
    where: { code },
    data: req.body,
  });

  res.json({ success: true, data: language });
}

export async function deleteLanguage(req: Request, res: Response): Promise<void> {
  const code = String(req.params.code);
  await prisma.language.delete({ where: { code } });

  res.json({ success: true, message: 'Language deleted' });
}

export async function getLanguageLevels(req: Request, res: Response): Promise<void> {
  const code = String(req.params.code);
  const language = await prisma.language.findUnique({
    where: { code },
    include: {
      units: {
        select: { levelId: true },
        distinct: ['levelId'],
      },
    },
  });

  if (!language) {
    throw new NotFoundError('Language');
  }

  const levelIds = (language as any).units.map((u: any) => u.levelId);

  const levels = await prisma.cefrLevel.findMany({
    where: { id: { in: levelIds } },
    orderBy: { sortOrder: 'asc' },
  });

  res.json({ success: true, data: levels });
}
