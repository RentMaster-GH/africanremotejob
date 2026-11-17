// lib/apiClient.ts
// Self-contained Custom Backend Client for African Remote Jobs (Next.js)

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user?: any;
}

export class CustomBackendClient {
  private baseUrl: string;
  private appId: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private authPromise: Promise<boolean> | null = null;

  constructor(baseUrl?: string, appId?: string) {
    const rawUrl =
      baseUrl ||
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BACKEND_URL) ||
      'https://api.credibleartisans.com';
    this.baseUrl = rawUrl.replace(/\/+$/, '').replace(/\/auth$/, '');
    this.appId =
      appId ||
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_ID) ||
      'african-remote-job';

    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(`${this.appId}_access_token`);
      this.refreshToken = localStorage.getItem(`${this.appId}_refresh_token`);
    }
  }

  private saveTokens(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${this.appId}_access_token`, accessToken);
      if (refreshToken) {
        localStorage.setItem(`${this.appId}_refresh_token`, refreshToken);
      }
    }
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${this.appId}_access_token`);
      localStorage.removeItem(`${this.appId}_refresh_token`);
    }
  }

  private normalizeRecord(item: any): any {
    if (!item || typeof item !== 'object') return item;
    if (item.data && typeof item.data === 'object' && !Array.isArray(item.data)) {
      return {
        ...item.data,
        id: item.id ?? item.data.id,
        owner_id: item.owner_id ?? item.data.owner_id,
        collection: item.collection ?? item.data.collection,
        created_at: item.created_at ?? item.data.created_at,
        updated_at: item.updated_at ?? item.data.updated_at,
      };
    }
    return item;
  }

  private getGuestCredentials(): { email: string; password: string } {
    const fallbackEmail = `guest_${this.appId}@africanremotejob.com`;
    const fallbackPass = `GuestPass_${this.appId}_2026!`;
    if (typeof window === 'undefined') {
      return { email: fallbackEmail, password: fallbackPass };
    }
    let email = localStorage.getItem(`${this.appId}_guest_email`);
    let password = localStorage.getItem(`${this.appId}_guest_password`);
    if (!email || !password) {
      const rand = Math.random().toString(36).slice(2, 10);
      email = `guest_${Date.now()}_${rand}@africanremotejob.com`;
      password = `Guest_${rand}_${Date.now()}!`;
      localStorage.setItem(`${this.appId}_guest_email`, email);
      localStorage.setItem(`${this.appId}_guest_password`, password);
    }
    return { email, password };
  }

  private async ensureGuestSession(forceReauth = false): Promise<boolean> {
    if (this.accessToken && !forceReauth) return true;
    if (this.authPromise) return this.authPromise;

    this.authPromise = (async () => {
      try {
        const { email, password } = this.getGuestCredentials();

        const loginRes = await fetch(`${this.baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_id: this.appId, email, password }),
        });

        if (loginRes.ok) {
          const data = await loginRes.json();
          const token = data?.accessToken || data?.token || data?.access_token;
          if (token) {
            this.saveTokens(token, data?.refreshToken || data?.refresh_token);
            return true;
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
            custom_claims: { guest: true },
          }),
        });

        if (regRes.ok) {
          const regData = await regRes.json().catch(() => ({}));
          const regToken = regData?.accessToken || regData?.token || regData?.access_token;
          if (regToken) {
            this.saveTokens(regToken, regData?.refreshToken || regData?.refresh_token);
            return true;
          }

          const secondLoginRes = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ app_id: this.appId, email, password }),
          });
          if (secondLoginRes.ok) {
            const loginData = await secondLoginRes.json();
            const token = loginData?.accessToken || loginData?.token || loginData?.access_token;
            if (token) {
              this.saveTokens(token, loginData?.refreshToken || loginData?.refresh_token);
              return true;
            }
          }
        }
        return false;
      } catch {
        return false;
      } finally {
        this.authPromise = null;
      }
    })();

    return this.authPromise;
  }

  private async request<T = any>(
    path: string,
    options: RequestInit = {},
    retry = true
  ): Promise<T> {
    if (!this.accessToken && !path.startsWith('/auth/')) {
      await this.ensureGuestSession();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && retry && !path.startsWith('/auth/')) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        return this.request<T>(path, options, false);
      }
      const reauthed = await this.ensureGuestSession(true);
      if (reauthed) {
        return this.request<T>(path, options, false);
      }
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }
    return data as T;
  }

  private async tryRefresh(): Promise<boolean> {
    if (!this.refreshToken) return false;
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      if (!res.ok) {
        this.clearTokens();
        return false;
      }
      const tokens: AuthTokens = await res.json();
      this.saveTokens(tokens.accessToken, tokens.refreshToken);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  async register(
    email: string,
    password: string,
    role = 'user',
    customClaims: Record<string, any> = {}
  ) {
    const normalizedRole = role === 'admin' ? 'admin' : 'user';
    const mergedClaims = {
      ...customClaims,
      account_role: customClaims?.account_role || role,
    };

    const data = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        app_id: this.appId,
        email,
        password,
        role: normalizedRole,
        custom_claims: mergedClaims,
      }),
    });

    if (data?.accessToken) {
      this.saveTokens(data.accessToken, data.refreshToken);
    }
    return data;
  }

  async login(email: string, password: string) {
    const tokens = await this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ app_id: this.appId, email, password }),
    });
    this.saveTokens(tokens.accessToken, tokens.refreshToken);
    return tokens;
  }

  async logout() {
    try {
      if (this.refreshToken) {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      }
    } finally {
      this.clearTokens();
    }
  }

  async getMe() {
    if (!this.accessToken) return null;
    try {
      const data = await this.request<{ payload: any }>('/me');
      return data.payload;
    } catch {
      return null;
    }
  }

  async list<T = any>(collection: string): Promise<T[]> {
    const res = await this.request<any>(`/data/${collection}`);
    const rawList = Array.isArray(res) ? res : res?.records || res?.data || [];
    return rawList.map((item: any) => this.normalizeRecord(item)) as T[];
  }

  async create<T = any>(collection: string, payload: Record<string, any>): Promise<T> {
    const res = await this.request<any>(`/data/${collection}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return this.normalizeRecord(res) as T;
  }

  async update<T = any>(collection: string, id: string, updates: Record<string, any>): Promise<T> {
    const res = await this.request<any>(`/data/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return this.normalizeRecord(res) as T;
  }

  async remove(collection: string, id: string): Promise<{ deleted: boolean; id: string }> {
    return this.request(`/data/${collection}/${id}`, {
      method: 'DELETE',
    });
  }
}
