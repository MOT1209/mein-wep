import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export async function getProfile(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: {
      userLanguages: {
        include: { language: { select: { code: true, name: true, nativeName: true, flagEmoji: true } } },
      },
      userAchievements: {
        include: { achievement: true },
      },
    },
  });

  if (!user) throw new NotFoundError('User');

  const { passwordHash, ...userWithoutPassword } = user;

  res.json({ success: true, data: userWithoutPassword });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: req.body,
    select: { id: true, username: true, email: true, xp: true, coins: true, streakCount: true },
  });

  res.json({ success: true, data: user });
}

export async function addLanguage(req: Request, res: Response): Promise<void> {
  const { languageCode, targetLevel } = req.body;

  const language = await prisma.language.findUnique({ where: { code: languageCode } });
  if (!language) throw new NotFoundError('Language');

  const userLanguage = await prisma.userLanguage.create({
    data: {
      userId: req.user!.userId,
      languageId: language.id,
      targetLevel: targetLevel || 'A1',
    },
    include: { language: { select: { code: true, name: true, flagEmoji: true } } },
  });

  res.status(201).json({ success: true, data: userLanguage });
}

export async function getMyLanguages(req: Request, res: Response): Promise<void> {
  const languages = await prisma.userLanguage.findMany({
    where: { userId: req.user!.userId },
    include: { language: { select: { code: true, name: true, nativeName: true, flagEmoji: true, direction: true } } },
  });

  res.json({ success: true, data: languages });
}

export async function updateLessonProgress(req: Request, res: Response): Promise<void> {
  const lessonId = String(req.params.lessonId);
  const { isCompleted, score, xpEarned } = req.body;

  const progress = await prisma.userLessonProgress.upsert({
    where: {
      userId_lessonId: { userId: req.user!.userId, lessonId },
    },
    update: {
      isCompleted: isCompleted ?? undefined,
      score: score ?? undefined,
      xpEarned: xpEarned ?? undefined,
      attempts: { increment: 1 },
      lastAttemptAt: new Date(),
      completedAt: isCompleted ? new Date() : undefined,
    },
    create: {
      userId: req.user!.userId,
      lessonId,
      isCompleted: isCompleted || false,
      score,
      xpEarned: xpEarned || 0,
      attempts: 1,
      lastAttemptAt: new Date(),
      completedAt: isCompleted ? new Date() : undefined,
    },
  });

  if (isCompleted && xpEarned) {
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { xp: { increment: xpEarned }, todayXp: { increment: xpEarned } },
    });
  }

  res.json({ success: true, data: progress });
}

export async function getMyProgress(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  const [lessonProgress, totalLessons, totalXp] = await Promise.all([
    prisma.userLessonProgress.findMany({
      where: { userId },
      include: {
        lesson: { select: { id: true, title: true, category: true } },
      },
      orderBy: { lastAttemptAt: 'desc' },
    }),
    prisma.lesson.count({ where: { isPublished: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { xp: true } }),
  ]);

  res.json({
    success: true,
    data: {
      lessonsCompleted: lessonProgress.filter(p => p.isCompleted).length,
      totalLessons,
      totalXp: totalXp?.xp || 0,
      lessonProgress,
    },
  });
}
