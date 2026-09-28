import type { AccessTokenPayload } from '../lib/tokens.js';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      authTime?: number;
    }
  }
}

export {};
