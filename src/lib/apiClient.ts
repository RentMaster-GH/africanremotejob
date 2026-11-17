export interface BackendUser {
  id: string;
  app_id: string;
  email: string;
  role: string;
  custom_claims?: Record<string, any>;
}

export interface BackendRecord {
  id: string;
  collection: string;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export class CustomBackendClient {
  private baseUrl: string;
  private appId: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string, appId: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.appId = appId;
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(`${this.appId}_access_token`);
      this.refreshToken = localStorage.getItem(`${this.appId}_refresh_token`);
    }
  }

  private setTokens(accessToken: string | null, refreshToken: string | null) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      if (accessToken) {
        localStorage.setItem(`${this.appId}_access_token`, accessToken);
      } else {
        localStorage.removeItem(`${this.appId}_access_token`);
      }
      if (refreshToken) {
        localStorage.setItem(`${this.appId}_refresh_token`, refreshToken);
      } else {
        localStorage.removeItem(`${this.appId}_refresh_token`);
      }
    }
  }

  private normalizeRecord(raw: any): BackendRecord {
    if (!raw || typeof raw !== 'object') return raw;
    const nested = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : {};
    return {
      ...nested,
      id: raw.id ?? nested.id,
      collection: raw.collection ?? nested.collection,
      owner_id: raw.owner_id ?? nested.owner_id,
      created_at: raw.created_at ?? nested.created_at,
      updated_at: raw.updated_at ?? nested.updated_at,
    };
  }

  private async request(path: string, options: RequestInit = {}, retry = true): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401 && retry && this.refreshToken) {
      const refreshed = await this.refresh();
      if (refreshed) {
        return this.request(path, options, false);
      }
    }

    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }

    if (!res.ok) {
      throw new Error(data?.error || data?.message || `Request failed with status ${res.status}`);
    }

    return data;
  }

  async register(email: string, password: string, customClaims: Record<string, any> = {}, role = 'user') {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        app_id: this.appId,
        email,
        password,
        role,
        custom_claims: customClaims,
      }),
    }, false);

    if (data?.accessToken) {
      this.setTokens(data.accessToken, data.refreshToken || null);
    }
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        app_id: this.appId,
        email,
        password,
      }),
    }, false);

    if (data?.accessToken) {
      this.setTokens(data.accessToken, data.refreshToken || null);
    }
    return data;
  }

  async refresh(): Promise<boolean> {
    if (!this.refreshToken) return false;
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      if (!res.ok) {
        this.setTokens(null, null);
        return false;
      }
      const data = await res.json();
      if (data?.accessToken) {
        this.setTokens(data.accessToken, data.refreshToken || this.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async logout() {
    try {
      if (this.refreshToken) {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        }, false);
      }
    } finally {
      this.setTokens(null, null);
    }
  }

  async getCurrentUser(): Promise<BackendUser | null> {
    if (!this.accessToken) return null;
    try {
      const res = await this.request('/me', { method: 'GET' });
      const payload = res?.payload || res?.user || res;
      if (!payload) return null;
      return {
        id: payload.sub || payload.id,
        app_id: payload.app_id || this.appId,
        email: payload.email || '',
        role: payload.role || 'user',
        custom_claims: payload.custom_claims || payload,
      };
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.accessToken);
  }

  async list(collection: string): Promise<BackendRecord[]> {
    const res = await this.request(`/data/${collection}`, { method: 'GET' });
    const records = Array.isArray(res) ? res : (res?.records || []);
    return records.map((item: any) => this.normalizeRecord(item));
  }

  async create(collection: string, data: Record<string, any>): Promise<BackendRecord> {
    const res = await this.request(`/data/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.normalizeRecord(res);
  }

  async update(collection: string, id: string, updates: Record<string, any>): Promise<BackendRecord> {
    const res = await this.request(`/data/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return this.normalizeRecord(res);
  }

  async remove(collection: string, id: string): Promise<{ deleted: boolean; id: string }> {
    return this.request(`/data/${collection}/${id}`, {
      method: 'DELETE',
    });
  }
}
