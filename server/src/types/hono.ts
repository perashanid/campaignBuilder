import { Context } from 'hono';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export type Variables = {
  user: AuthUser;
};

export type AuthContext = Context<{ Variables: Variables }>;