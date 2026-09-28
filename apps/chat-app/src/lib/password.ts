import bcrypt from 'bcryptjs';

// Cost 12 in production; tests would otherwise spend minutes hashing.
const ROUNDS = process.env.NODE_ENV === 'test' ? 4 : 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
