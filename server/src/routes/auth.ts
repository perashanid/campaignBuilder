import { Hono, Context, Next } from 'hono';
import { User, Session } from '../db/schema.js';
import { Variables } from '../types/hono.js';
import { getDB } from '../db/index.js';
import { ObjectId } from 'mongodb';

const auth = new Hono();

// Helper to generate token
function generateToken(): string {
  return `token_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  return `hashed_${password}`;
}

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    const db = getDB();

    // Find user by email
    const user = await db.collection<User>('users').findOne({ email });

    if (!user) {
      return c.json({ error: { message: 'Invalid email or password' } }, 401);
    }

    const hashedPassword = hashPassword(password);

    if (user.password_hash !== hashedPassword) {
      return c.json({ error: { message: 'Invalid email or password' } }, 401);
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.collection<Session>('sessions').insertOne({
      user_id: user._id!.toString(),
      token,
      expires_at: expiresAt,
      created_at: new Date(),
    });

    return c.json({
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: { message: 'Login failed' } }, 500);
  }
});

// Register endpoint
auth.post('/register', async (c) => {
  try {
    const { name, email, password, confirmPassword } = await c.req.json();
    const db = getDB();

    if (password !== confirmPassword) {
      return c.json({ error: { message: 'Passwords do not match' } }, 400);
    }

    // Check if user already exists
    const existingUser = await db.collection<User>('users').findOne({ email });

    if (existingUser) {
      return c.json({ error: { message: 'Email already exists' } }, 400);
    }

    // Create new user
    const hashedPassword = hashPassword(password);
    const now = new Date();

    const result = await db.collection<User>('users').insertOne({
      email,
      name,
      password_hash: hashedPassword,
      created_at: now,
      updated_at: now,
    });

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.collection<Session>('sessions').insertOne({
      user_id: result.insertedId.toString(),
      token,
      expires_at: expiresAt,
      created_at: new Date(),
    });

    return c.json({
      user: {
        id: result.insertedId.toString(),
        email,
        name,
        createdAt: now,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: { message: 'Registration failed' } }, 500);
  }
});

// Get current user endpoint
auth.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: { message: 'No token provided' } }, 401);
    }

    const token = authHeader.substring(7);
    const db = getDB();

    // Find session by token
    const session = await db.collection<Session>('sessions').findOne({
      token,
      expires_at: { $gt: new Date() }
    });

    if (!session) {
      return c.json({ error: { message: 'Invalid or expired token' } }, 401);
    }

    // Get user
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(session.user_id)
    });

    if (!user) {
      return c.json({ error: { message: 'User not found' } }, 404);
    }

    return c.json({
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: { message: 'Failed to get user' } }, 500);
  }
});

// Logout endpoint
auth.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: { message: 'No token provided' } }, 401);
    }

    const token = authHeader.substring(7);
    const db = getDB();

    // Delete session
    await db.collection<Session>('sessions').deleteOne({ token });

    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: { message: 'Logout failed' } }, 500);
  }
});

// Middleware to authenticate user
export async function authenticateUser(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: { message: 'No token provided' } }, 401);
    }

    const token = authHeader.substring(7);
    const db = getDB();

    // Find session by token
    const session = await db.collection<Session>('sessions').findOne({
      token,
      expires_at: { $gt: new Date() }
    });

    if (!session) {
      return c.json({ error: { message: 'Invalid or expired token' } }, 401);
    }

    // Get user
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(session.user_id)
    });

    if (!user) {
      return c.json({ error: { message: 'User not found' } }, 404);
    }

    c.set('user', {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    });

    await next();
  } catch (error) {
    console.error('Authentication error:', error);
    return c.json({ error: { message: 'Authentication failed' } }, 500);
  }
}

export default auth;
