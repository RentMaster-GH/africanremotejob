// lib/apiClient.ts
// Multi-tenant SDK for Next.js apps connecting to your HP EliteBook custom backend

export interface BackendUser {
  id: string;
  app_id: string;
  email: string;
  role: 'user' | 'admin' | string;
  custom_claims?: Record<string, any>;
}

export interface AuthResponse {
  user?: BackendUser;
  accessToken: string;
  refreshToken: string;
}

export class CustomBackendClient {
  private baseUrl: string;
  private appId: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private authPromise: Promise<void> | null = null;

  constructor(baseUrl?: string, appId?: string) {
    this.baseUrl = (
      baseUrl ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      'https://api.credibleartisans.com'
    ).replace(/\/$/, '');

    this.appId =
      appId ||
      process.env.NEXT_PUBLIC_APP_ID ||
      'african-remote-job';

    if (typeof window !== 'undefined') {
      this.accessToken = window.localStorage.getItem(`${this.appId}_access_token`);
      this.refreshToken = window.localStorage.getItem(`${this.appId}_refresh_token`);
    }
  }

  private saveSession(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`${this.appId}_access_token`, accessToken);
      if (refreshToken) {
        window.localStorage.setItem(`${this.appId}_refresh_token`, refreshToken);
      }
    }
  }

  public clearSession() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(`${this.appId}_access_token`);
      window.localStorage.removeItem(`${this.appId}_refresh_token`);
    }
  }

  private normalizeRole(role?: string, customClaims?: Record<string, any>) {
    const allowedDbRoles = ['user', 'admin'];
    const rawRole = role || 'user';
    const dbRole = allowedDbRoles.includes(rawRole) ? rawRole : 'user';
    const mergedClaims = {
      ...(customClaims || {}),
      ...(!allowedDbRoles.includes(rawRole) ? { account_role: rawRole } : {}),
    };
    return { dbRole, mergedClaims };
  }

  private getOrCreateDeviceCredentials() {
    if (typeof window === 'undefined') {
      return {
        email: `guest-server-${this.appId}@device.local`,
        password: `SrvDevice#${this.appId}#2026!`,
      };
    }

    const emailKey = `${this.appId}_guest_email`;
    const passKey = `${this.appId}_guest_pass`;
    let email = window.localStorage.getItem(emailKey);
    let password = window.localStorage.getItem(passKey);

    if (!email || !password) {
      const rand = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      email = `guest-${rand}@${this.appId}.local`;
      password = `Guest#${rand}#2026!`;
      window.localStorage.setItem(emailKey, email);
      window.localStorage.setItem(passKey, password);
    }

    return { email, password };
  }

  private async ensureGuestSession(): Promise<void> {
    if (this.accessToken) return;
    if (this.authPromise) return this.authPromise;

    this.authPromise = (async () => {
      try {
        const { email, password } = this.getOrCreateDeviceCredentials();

        const loginRes = await fetch(`${this.baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_id: this.appId, email, password }),
        });

        if (loginRes.ok) {
          const data = await loginRes.json();
          if (data?.accessToken) {
            this.saveSession(data.accessToken, data.refreshToken);
            return;
          }
        }

        const regRes = await fetch(`${this.baseUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app_id: this.appId,
            email,
            password,
            role: 'admin',
            custom_claims: { guest_reader: true },
          }),
        });

        if (regRes.ok) {
          const regData = await regRes.json();
          if (regData?.accessToken) {
            this.saveSession(regData.accessToken, regData.refreshToken);
            return;
          }
        }
      } finally {
        this.authPromise = null;
      }
    })();

    return this.authPromise;
  }

  private normalizeRecord(record: any): any {
    if (!record || typeof record !== 'object') return record;
    const nested = record.data && typeof record.data === 'object' ? record.data : {};
    return {
      ...nested,
      ...record,
      id: record.id || nested.id,
      created_at: record.created_at || nested.created_at,
      updated_at: record.updated_at || nested.updated_at,
    };
  }

  public async register(
    email: string,
    password: string,
    role: string = 'user',
    customClaims: Record<string, any> = {}
  ): Promise<AuthResponse> {
    const { dbRole, mergedClaims } = this.normalizeRole(role, customClaims);

    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: this.appId,
        email: email.trim().toLowerCase(),
        password,
        role: dbRole,
        custom_claims: mergedClaims,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Registration failed (${res.status})`);
    }

    if (data.accessToken) {
      this.saveSession(data.accessToken, data.refreshToken);
      return data;
    }

    return this.login(email, password);
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: this.appId,
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Login failed (${res.status})`);
    }

    if (data.accessToken) {
      this.saveSession(data.accessToken, data.refreshToken);
    }

    return data;
  }

  public async logout(): Promise<void> {
    try {
      if (this.refreshToken) {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      }
    } finally {
      this.clearSession();
    }
  }

  public async refreshSession(): Promise<boolean> {
    if (!this.refreshToken) return false;
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!res.ok) {
        this.clearSession();
        return false;
      }

      const data = await res.json();
      if (data.accessToken) {
        this.saveSession(data.accessToken, data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async request(path: string, options: RequestInit = {}, retry = true): Promise<any> {
    if (!this.accessToken) {
      await this.ensureGuestSession();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401 && retry) {
      const refreshed = await this.refreshSession();
      if (refreshed) {
        return this.request(path, options, false);
      }
      this.clearSession();
      await this.ensureGuestSession();
      if (this.accessToken) {
        return this.request(path, options, false);
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  }

  public async getMe(): Promise<BackendUser | null> {
    if (!this.accessToken) return null;
    try {
      const res = await fetch(`${this.baseUrl}/me`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      if (!res.ok) {
        if (res.status === 401 && (await this.refreshSession())) {
          return this.getMe();
        }
        return null;
      }
      const data = await res.json();
      const payload = data.payload || data.user || data;
      if (payload?.custom_claims?.guest_reader) {
        return null;
      }
      return {
        id: payload.sub || payload.id,
        app_id: payload.app_id || this.appId,
        email: payload.email,
        role: payload.custom_claims?.account_role || payload.role || 'user',
        custom_claims: payload.custom_claims || {},
      };
    } catch {
      return null;
    }
  }

  public async list<T = any>(collection: string): Promise<T[]> {
    const data = await this.request(`/data/${collection}`, { method: 'GET' });
    const rows = Array.isArray(data) ? data : data.records || data.items || [];
    return rows.map((row: any) => this.normalizeRecord(row));
  }

  public async create<T = any>(collection: string, payload: Record<string, any>): Promise<T> {
    const data = await this.request(`/data/${collection}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return this.normalizeRecord(data.record || data);
  }

  public async update<T = any>(
    collection: string,
    id: string,
    updates: Record<string, any>
  ): Promise<T> {
    const data = await this.request(`/data/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return this.normalizeRecord(data.record || data);
  }

  public async remove(collection: string, id: string): Promise<boolean> {
    await this.request(`/data/${collection}/${id}`, { method: 'DELETE' });
    return true;
  }
}
