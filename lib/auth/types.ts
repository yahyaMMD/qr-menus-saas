export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  type: 'access' | 'refresh';
  exp?: number;
  iat?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  tokens: AuthTokens;
}

