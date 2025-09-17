import { Hono, Context, Next } from 'hono';
import { User, Session } from '../db/schema.js';
import { Variables } from '../types/hono.js';
import { pool } from '../db/index.js';

const auth = new Hono();

// Helper to generate token
function generateToken(): string {
  return `token_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Helper to generate user ID
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Helper to generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  // This is a simple hash for demo purposes
  // In production, use bcrypt or similar
  return `hashed_${password}`;
}

// Login endpoint
auth.post('/login', async (c) => {
  const client = await pool.connect();
  
  try {
    const { email, password } = await c.req.json();

    // Find user by email
    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: { message: 'Invalid email or password' } }, 401);
    }

    const user = userResult.rows[0];
    const hashedPassword = hashPassword(password);

    if (user.password_hash !== hashedPassword) {
      return c.json({ error: { message: 'Invalid email or password' } }, 401);
    }

    // Create session
    const token = generateToken();
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await client.query(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
      [sessionId, user.id, token, expiresAt]
    );

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: { message: 'Login failed' } }, 500);
  } finally {
    client.release();
  }
});

// Register endpoint
auth.post('/register', async (c) => {
  const client = await pool.connect();
  
  try {
    const { name, email, password, confirmPassword } = await c.req.json();

    if (password !== confirmPassword) {
      return c.json({ error: { message: 'Passwords do not match' } }, 400);
    }

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return c.json({ error: { message: 'Email already exists' } }, 400);
    }

    // Create new user
    const userId = generateUserId();
    const hashedPassword = hashPassword(password);

    await client.query(
      'INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)',
      [userId, email, name, hashedPassword]
    );

    // Create session
    const token = generateToken();
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await client.query(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
      [sessionId, userId, token, expiresAt]
    );

    return c.json({
      user: {
        id: userId,
        email,
        name,
        createdAt: new Date(),
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: { message: 'Registration failed' } }, 500);
  } finally {
    client.release();
  }
});

// Get current user endpoint
auth.get('/me', async (c) => {
  const client = await pool.connect();
  
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: { message: 'No token provided' } }, 401);
    }

    const token = authHeader.substring(7);

    // Find session by token
    const sessionResult = await client.query(
      'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return c.json({ error: { message: 'Invalid or expired token' } }, 401);
    }

    const session = sessionResult.rows[0];

    // Get user
    const userResult = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [session.user_id]
    );

    if (userResult.rows.length === 0) {
      return c.json({ error: { message: 'User not found' } }, 404);
    }

    const user = userResult.rows[0];

    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: { message: 'Failed to get user' } }, 500);
  } finally {
    client.release();
  }
});

// Logout endpoint
auth.post('/logout', async (c) => {
  const client = await pool.connect();
  
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: { message: 'No token provided' } }, 401);
    }

    const token = authHeader.substring(7);

    // Delete session
    await client.query('DELETE FROM sessions WHERE token = $1', [token]);

    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: { message: 'Logout failed' } }, 500);
  } finally {
    client.release();
  }
});

// Middleware to authenticate user
export async function authenticateUser(c: Context, next: Next) {
  const client = await pool.connect();
  
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: { message: 'No token provided' } }, 401);
    }

    const token = authHeader.substring(7);

    // Find session by token
    const sessionResult = await client.query(
      'SELECT s.*, u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = $1 AND s.expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return c.json({ error: { message: 'Invalid or expired token' } }, 401);
    }

    const user = sessionResult.rows[0];
    c.set('user', {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    });

    await next();
  } catch (error) {
    console.error('Authentication error:', error);
    return c.json({ error: { message: 'Authentication failed' } }, 500);
  } finally {
    client.release();
  }
}

export default auth;