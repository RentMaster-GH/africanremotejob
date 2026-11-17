const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  'https://api.credibleartisans.com'
).replace(/\/+$/, '');

const APP_ID =
  process.env.NEXT_PUBLIC_APP_ID ||
  process.env.APP_ID ||
  'african-remote-job';

const ADMIN_SECRET = process.env.ADMIN_ROTATION_SECRET || '';

let cachedAdminToken: string | null = null;

async function getAdminToken(): Promise<string | null> {
  if (cachedAdminToken) return cachedAdminToken;

  const email = `server-admin-${APP_ID}@${APP_ID}.local`;
  const password = `Admin_${APP_ID}_Server_2026!`;

  try {
    const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: APP_ID, email, password }),
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      cachedAdminToken = data?.accessToken || data?.token || null;
      return cachedAdminToken;
    }

    const regRes = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: APP_ID,
        email,
        password,
        role: 'admin',
      }),
    });

    if (regRes.ok) {
      const regData = await regRes.json();
      cachedAdminToken = regData?.accessToken || regData?.token || null;
      return cachedAdminToken;
    }
  } catch (err) {
    console.error('supabaseAdmin auth error:', err);
  }

  return null;
}

class AdminQueryBuilder {
  private table: string;
  private filters: Record<string, any> = {};
  private action: 'select' | 'update' | 'insert' | 'delete' = 'select';
  private payload: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(_columns = '*') {
    if (this.action === 'select') {
      this.action = 'select';
    }
    return this;
  }

  update(values: Record<string, any>) {
    this.action = 'update';
    this.payload = values;
    return this;
  }

  insert(values: Record<string, any> | Record<string, any>[]) {
    this.action = 'insert';
    this.payload = values;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters[column] = value;
    return this;
  }

  order(_column: string, _opts?: { ascending?: boolean }) {
    return this;
  }

  limit(_count: number) {
    return this;
  }

  single() {
    return this.execute(true);
  }

  maybeSingle() {
    return this.execute(true);
  }

  then(resolve: (value: any) => any, reject?: (reason: any) => any) {
    return this.execute(false).then(resolve, reject);
  }

  private async execute(single: boolean): Promise<{ data: any; error: any }> {
    try {
      const token = await getAdminToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (ADMIN_SECRET) headers['x-admin-secret'] = ADMIN_SECRET;

      if (this.action === 'insert') {
        const items = Array.isArray(this.payload) ? this.payload : [this.payload];
        const created = [];
        for (const item of items) {
          const res = await fetch(`${BACKEND_URL}/data/${this.table}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(item),
          });
          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            return { data: null, error: { message: errBody.error || `Insert failed (${res.status})` } };
          }
          const row = await res.json();
          created.push(row?.data ? { ...row.data, id: row.id, created_at: row.created_at } : row);
        }
        return { data: single ? created[0] ?? null : created, error: null };
      }

      if (this.action === 'update') {
        const targetId = this.filters.id;
        if (!targetId) {
          return { data: null, error: { message: 'Missing id filter for update' } };
        }
        const res = await fetch(`${BACKEND_URL}/data/${this.table}/${targetId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(this.payload || {}),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          return { data: null, error: { message: errBody.error || `Update failed (${res.status})` } };
        }
        const row = await res.json();
        const normalized = row?.data ? { ...row.data, id: row.id, updated_at: row.updated_at } : row;
        return { data: single ? normalized : [normalized], error: null };
      }

      if (this.action === 'delete') {
        const targetId = this.filters.id;
        if (!targetId) {
          return { data: null, error: { message: 'Missing id filter for delete' } };
        }
        const res = await fetch(`${BACKEND_URL}/data/${this.table}/${targetId}`, {
          method: 'DELETE',
          headers,
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          return { data: null, error: { message: errBody.error || `Delete failed (${res.status})` } };
        }
        return { data: null, error: null };
      }

      // SELECT
      const res = await fetch(`${BACKEND_URL}/data/${this.table}`, {
        method: 'GET',
        headers,
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        return { data: null, error: { message: errBody.error || `Fetch failed (${res.status})` } };
      }
      const json = await res.json();
      const rawRows = Array.isArray(json?.records) ? json.records : Array.isArray(json) ? json : [];
      let rows = rawRows.map((r: any) =>
        r?.data && typeof r.data === 'object'
          ? { ...r.data, id: r.id, owner_id: r.owner_id, created_at: r.created_at, updated_at: r.updated_at }
          : r
      );

      for (const [k, v] of Object.entries(this.filters)) {
        rows = rows.filter((row: any) => row?.[k] === v);
      }

      return { data: single ? rows[0] ?? null : rows, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err?.message || 'Unexpected admin query error' } };
    }
  }
}

export const supabaseAdmin = {
  from(table: string) {
    return new AdminQueryBuilder(table);
  },
};

export default supabaseAdmin;
