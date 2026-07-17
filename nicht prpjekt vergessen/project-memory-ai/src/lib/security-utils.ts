const rateLimitAttempts = new Map<string, { count: number; lastAttempt: number }>();

const securityUtils = {
  validateToken: (token: string): boolean => {
    if (!token || typeof token !== 'string') return false;
    return token.length > 0 && !token.includes('<script>');
  },
  
  sanitizeInput: (input: string): string => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*>/g, '');
  },
  
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  sanitizeUrl: (url: string): string => {
    if (typeof url !== 'string') return '';
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      return '';
    }
  },

  validateFileType: (fileName: string, allowedTypes: string[]): boolean => {
    if (!fileName || typeof fileName !== 'string') return false;
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  },

  sanitizeFileName: (fileName: string): string => {
    if (typeof fileName !== 'string') return '';
    return fileName
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 255);
  },

  generateSecureId: (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },

  rateLimit: {
    attempts: rateLimitAttempts,
    
    isAllowed: (identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
      const now = Date.now();
      const record = rateLimitAttempts.get(identifier);
      
      if (!record) {
        rateLimitAttempts.set(identifier, { count: 1, lastAttempt: now });
        return true;
      }
      
      if (now - record.lastAttempt > windowMs) {
        rateLimitAttempts.set(identifier, { count: 1, lastAttempt: now });
        return true;
      }
      
      if (record.count >= maxAttempts) {
        return false;
      }
      
      record.count++;
      record.lastAttempt = now;
      return true;
    },
    
    reset: (identifier: string): void => {
      rateLimitAttempts.delete(identifier);
    }
  }
};

export default securityUtils;