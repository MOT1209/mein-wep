import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from 'next-auth/adapters';
import type { User as NextAuthUser } from 'next-auth';
import { supabase } from './supabase';

async function fetchUser(id: string): Promise<AdapterUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return mapUser(data);
}

export function SupabaseAdapter(): Adapter {
  return {
    async createUser(user: AdapterUser) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: user.email,
          name: user.name,
          email_verified: user.emailVerified?.toISOString(),
          image: user.image,
          username: user.email?.split('@')[0],
          display_name: user.name,
          password_hash: 'OAUTH_NO_PASSWORD',
          role: 'USER',
          is_active: true,
        })
        .select()
        .single();
      if (error) {
        console.error('[KING2 Adapter] createUser error:', error);
        throw error;
      }
      return mapUser(data);
    },

    async getUser(id: string) {
      return fetchUser(id);
    },

    async getUserByEmail(email: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (error || !data) return null;
      return mapUser(data);
    },

    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      const { data, error } = await supabase
        .from('accounts')
        .select('user_id')
        .eq('provider', provider)
        .eq('provider_account_id', providerAccountId)
        .maybeSingle();
      if (error || !data) return null;
      return fetchUser(data.user_id);
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, 'id'>) {
      const updates: Record<string, any> = {};
      if (user.name !== undefined) updates.name = user.name;
      if (user.email !== undefined) updates.email = user.email;
      if (user.image !== undefined) updates.image = user.image;
      if (user.emailVerified !== undefined) updates.email_verified = user.emailVerified?.toISOString();
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return mapUser(data);
    },

    async deleteUser(userId: string) {
      await supabase.from('users').delete().eq('id', userId);
    },

    async linkAccount(account: AdapterAccount) {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: account.userId,
          type: account.type,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        })
        .select()
        .single();
      if (error) {
        console.error('[KING2 Adapter] linkAccount error:', error);
        throw error;
      }
      return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        provider: data.provider,
        providerAccountId: data.provider_account_id,
        refresh_token: data.refresh_token,
        access_token: data.access_token,
        expires_at: data.expires_at,
        token_type: data.token_type,
        scope: data.scope,
        id_token: data.id_token,
        session_state: data.session_state,
      } as AdapterAccount;
    },

    async createSession(session: { sessionToken: string; userId: string; expires: Date }) {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          session_token: session.sessionToken,
          user_id: session.userId,
          expires: session.expires.toISOString(),
        })
        .select()
        .single();
      if (error) {
        console.error('[KING2 Adapter] createSession error:', error);
        throw error;
      }
      return {
        id: data.id,
        sessionToken: data.session_token,
        userId: data.user_id,
        expires: new Date(data.expires),
      } as AdapterSession;
    },

    async getSessionAndUser(sessionToken: string) {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, users(*)')
        .eq('session_token', sessionToken)
        .maybeSingle();
      if (error || !data) return null;
      return {
        session: {
          id: data.id,
          sessionToken: data.session_token,
          userId: data.user_id,
          expires: new Date(data.expires),
        } as AdapterSession,
        user: mapUser(data.users),
      };
    },

    async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>) {
      const updateData: Record<string, any> = {};
      if (session.expires) updateData.expires = session.expires.toISOString();
      const { data, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('session_token', session.sessionToken)
        .select()
        .single();
      if (error || !data) return null;
      return {
        id: data.id,
        sessionToken: data.session_token,
        userId: data.user_id,
        expires: new Date(data.expires),
      } as AdapterSession;
    },

    async deleteSession(sessionToken: string) {
      await supabase.from('sessions').delete().eq('session_token', sessionToken);
    },

    async createVerificationToken(verificationToken: { identifier: string; token: string; expires: Date }) {
      const { data, error } = await supabase
        .from('verification_tokens')
        .insert({
          identifier: verificationToken.identifier,
          token: verificationToken.token,
          expires: verificationToken.expires.toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return {
        identifier: data.identifier,
        token: data.token,
        expires: new Date(data.expires),
      } as VerificationToken;
    },

    async useVerificationToken(params: { identifier: string; token: string }) {
      const { data, error } = await supabase
        .from('verification_tokens')
        .delete()
        .eq('identifier', params.identifier)
        .eq('token', params.token)
        .select()
        .single();
      if (error || !data) return null;
      return {
        identifier: data.identifier,
        token: data.token,
        expires: new Date(data.expires),
      } as VerificationToken;
    },
  };
}

function mapUser(data: any): AdapterUser {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    emailVerified: data.email_verified ? new Date(data.email_verified) : null,
    image: data.image,
  };
}
