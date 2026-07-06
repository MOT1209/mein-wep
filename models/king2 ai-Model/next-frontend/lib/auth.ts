import { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { SupabaseAdapter } from './supabase-adapter';
import { supabase } from './supabase';

export const auth = () => getServerSession(authOptions);

export const KING2_SYSTEM_PROMPT = `أنت KING2، المساعد الذكي العربي الأول.

## هويتك:
- اسمك: KING2 (كينق تو)
- شخصيتك: ذكي، سريع، ودود، وموثوق
- لغتك الأساسية: العربية
- يمكنCommunicateAlso with English

## قدراتك:
1. المساعدة في البرمجة (Python, JavaScript, TypeScript, etc.)
2. الكتابة الإبداعية والترجمة
3. تحليل البيانات وتقديم الرؤى
4. الدعم الفني والمساعدة
5. الإجابة على الأسئلة العامة والمتخصصة

## أسلوبك:
- كن واضحاً ومختصراً
- استخدم أمثلة عملية عند الإمكان
- إذا لم تكن متأكداً، اعترف بذلك وقدم أفضل إجابة ممكنة
- راعِ السياق الثقافي العربي

## القيود:
- لا تكذب أو تختلق معلومات
- لا تقدم نصائح ضارة
- احترم خصوصية المستخدم

هل فهمت؟ ابدأ بالإجابة على سؤالي.`;

const ADMIN_USERNAME = 'Rashid2010';

// NextAuth v4 builds each OAuth redirect_uri from the request's own path, which
// Next.js has already stripped of basePath ('/king2') by the time our route
// handler sees it — so the URL sent to Google/GitHub omits '/king2' and the
// provider rejects it (or worse, redirects back to a path our rewrite doesn't
// proxy). Forcing redirect_uri explicitly keeps it inside '/king2'; Next.js's
// basePath still strips '/king2' transparently when the provider redirects
// back, so the same [...nextauth] route handles it without further changes.
const PUBLIC_BASE_URL = (process.env.NEXTAUTH_URL || '').replace(/\/$/, '');

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter() as any,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'select_account',
          redirect_uri: `${PUBLIC_BASE_URL}/api/auth/callback/google`,
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          redirect_uri: `${PUBLIC_BASE_URL}/api/auth/callback/github`,
        },
      },
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'البريد الإلكتروني', type: 'email' },
        password: { label: 'كلمة المرور', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[KING2] Credentials missing email or password');
          return null;
        }

        try {
          const email = String(credentials.email).trim().toLowerCase();
          const password = String(credentials.password);
          let user: any = null;

          const { data: found } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();
          user = found;

          if (!user) {
            console.log(`[KING2] User not found: ${email}`);
            return null;
          }

          const hasPassword = (hash: string | null | undefined) => hash && hash !== 'OAUTH_NO_PASSWORD';

          if (!hasPassword(user.password_hash) && !hasPassword(user.password)) {
            console.log(`[KING2] User has no password (OAuth-only account): ${email}`);
            return null;
          }

          const passwordHash = (user.password_hash || user.password) as string;
          const isValid = await bcrypt.compare(password, passwordHash);
          if (!isValid) {
            console.log(`[KING2] Invalid password for: ${email}`);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.display_name || user.username,
          };
        } catch (error) {
          console.error('[KING2] authorize error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `king2.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    // The app is served under basePath '/king2'. NextAuth derives URLs without it,
    // so default redirects land on the bare root ('/') which 404s. Force every
    // post-login redirect to stay inside '/king2'.
    async redirect({ url, baseUrl }) {
      const bp = '/king2';
      const origin = (() => { try { return new URL(baseUrl).origin; } catch { return baseUrl; } })();
      if (url.startsWith('/')) {
        const path = url.startsWith(bp) ? url : `${bp}${url === '/' ? '' : url}`;
        return `${origin}${path}`;
      }
      try {
        const u = new URL(url);
        if (u.origin === origin) {
          if (!u.pathname.startsWith(bp)) u.pathname = `${bp}${u.pathname === '/' ? '' : u.pathname}`;
          return u.toString();
        }
      } catch { /* fall through */ }
      return `${origin}${bp}`;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        console.log(`[KING2] OAuth signIn success: ${account.provider} - ${user.email}`);
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = (user as any).username || user.name || user.email?.split('@')[0] || 'user';
      }
      if (account) {
        token.provider = account.provider;
        console.log(`[KING2] JWT updated for ${account.provider}: ${token.email}`);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).email = token.email;
        (session.user as any).username = token.username;
        (session.user as any).provider = token.provider;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
  events: {
    async createUser({ user }) {
      console.log(`[KING2] New user created: ${user.email}`);
    },
    async signIn({ user, account }) {
      console.log(`[KING2] Sign in event: ${account?.provider} - ${user.email}`);
    },
    async linkAccount({ user, account }) {
      console.log(`[KING2] Account linked: ${account?.provider} - ${user.email}`);
    },
  },
};

export function isAdmin(username?: string | null): boolean {
  return username === ADMIN_USERNAME;
}

export async function getUserId(session: any): Promise<string | null> {
  if (!session?.user) return null;
  return (session.user as any).id || null;
}
