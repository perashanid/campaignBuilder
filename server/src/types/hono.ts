import { Context } from 'hono';
import { User } from '../db/schema.js';

export type Variables = {
  user: User;
};

export type AuthContext = Context<{ Variables: Variables }>;