export interface JwtSession {
  id: number;
  token: string;
  username: string;
  createdAt: string;
  lastAccessedAt: string;
  revokedAt?: string;
  active: boolean;
  userAgent?: string;
  ipAddress?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    email: string;
    role: string;
    enabled: boolean;
  };
}