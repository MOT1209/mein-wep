import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';

export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password, nativeLanguageCode } = req.body;

  // Check if username already exists
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    throw new ConflictError('Username already taken');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      nativeLanguageId: nativeLanguageCode
        ? (await prisma.language.findUnique({ where: { code: nativeLanguageCode } }))?.id
        : undefined,
    },
  });

  const payload = { userId: user.id, username: user.username };

  res.status(201).json({
    success: true,
    data: {
      user: { id: user.id, username: user.username, email: user.email },
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const payload = { userId: user.id, username: user.username };

  res.json({
    success: true,
    data: {
      user: { id: user.id, username: user.username, email: user.email },
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    },
  });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  try {
    const decoded = verifyToken(refreshToken);
    const payload = { userId: decoded.userId, username: decoded.username };

    res.json({
      success: true,
      data: {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
      },
    });
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      username: true,
      email: true,
      xp: true,
      coins: true,
      streakCount: true,
      dailyGoalXp: true,
      todayXp: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  res.json({ success: true, data: user });
}
