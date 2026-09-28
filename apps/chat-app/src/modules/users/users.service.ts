import { many, one } from '../../config/db.js';
import { errors } from '../../lib/errors.js';
import { isOnline } from '../../realtime/presence.js';
import type { SearchUserRow, UserRow } from '../../types/index.js';
import { toPublicUser } from '../../types/index.js';
import type { UpdateProfileInput } from './users.schemas.js';

export interface PublicProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: string | null;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

function toProfile(row: SearchUserRow): PublicProfile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: null,
    avatarUrl: row.avatar_url,
    isOnline: isOnline(row.id),
    lastSeenAt: row.last_seen_at ? row.last_seen_at.toISOString() : null,
  };
}

const PROFILE_COLUMNS = 'id, username, display_name, avatar_url, last_seen_at';

export async function getMe(userId: string) {
  const user = await one<UserRow>('select * from users where id = $1', [userId]);
  if (!user) throw errors.notFound('User not found.');
  return {
    ...toPublicUser(user),
    isOnline: true,
    lastSeenAt: user.last_seen_at?.toISOString() ?? null,
  };
}

export async function updateMe(userId: string, patch: UpdateProfileInput) {
  const sets: string[] = [];
  const params: unknown[] = [];
  const push = (column: string, value: unknown) => {
    params.push(value);
    sets.push(`${column} = $${params.length}`);
  };

  if (patch.displayName !== undefined) push('display_name', patch.displayName);
  if (patch.bio !== undefined) push('bio', patch.bio === '' ? null : patch.bio);
  if (patch.avatarUrl !== undefined) push('avatar_url', patch.avatarUrl === '' ? null : patch.avatarUrl);

  if (sets.length === 0) throw errors.validation('Provide at least one field to update.');

  params.push(userId);
  const row = await one<UserRow>(
    `update users set ${sets.join(', ')}, updated_at = now()
      where id = $${params.length}
      returning *`,
    params,
  );
  if (!row) throw errors.notFound('User not found.');
  return { ...toPublicUser(row), isOnline: true, lastSeenAt: row.last_seen_at?.toISOString() ?? null };
}

export async function search(q: string, limit: number, viewerId: string): Promise<PublicProfile[]> {
  const pattern = `%${escapeLike(q)}%`;
  const rows = await many<SearchUserRow>(
    `select ${PROFILE_COLUMNS}
       from users
      where id <> $1
        and is_disabled = false
        and (username ilike $2 escape '\\' or display_name ilike $2 escape '\\')
      order by
        case when lower(username) = lower($3) then 0
             when lower(username) like lower($3) || '%' then 1
             else 2 end,
        display_name asc
      limit $4`,
    [viewerId, pattern, q, limit],
  );
  return rows.map(toProfile);
}

export async function getByUsername(username: string): Promise<PublicProfile> {
  const row = await one<SearchUserRow>(
    `select ${PROFILE_COLUMNS} from users where lower(username) = lower($1) and is_disabled = false`,
    [username],
  );
  if (!row) throw errors.notFound('User not found.');
  return toProfile(row);
}
