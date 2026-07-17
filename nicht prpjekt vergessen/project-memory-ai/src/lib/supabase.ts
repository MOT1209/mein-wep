import { createBrowserClient } from '@supabase/ssr';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('Supabase URL must use HTTPS');
}

// Create secure client with additional configuration
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  // Additional security options
  global: {
    headers: {
      'X-Client-Info': 'project-memory-ai'
    }
  }
});

// Helper functions for security
export const securityUtils = {
  validateToken: (token: string): boolean => {
    if (!token || typeof token !== 'string') return false;
    return token.length > 0 && !token.includes('<script>');
  },
  
  sanitizeInput: (input: string): string => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },
  
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};
