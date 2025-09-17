import { Hono, Context, Next } from 'hono';
import { User, Session } from '../db/schema.js';
import { Variables } from '../types/hono.js';

const auth = new Hono();

// Mock users for development
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    password_hash: 'demo123', // In real app, this would be hashed
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
];

const mockSessions: Session[] = [];

// Helper to generate token
function generateToken(): string {
  return `token_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Helper to find user by email
function findUserByEmail(email: string): User | undefined {
  return mockUsers.find(user => user.email === email);
}

// Helper to find session by token
function findSessionByToken(token: string): Session | undefined {
  return mockSessions.find(session =>
    session.token === token && session.expires_at > new Date()
  );
}

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    const user = findUserByEmail(email);
    if (!user || user.password_hash !== password) {
      return c.json({ error: { message: 'Invalid email or password' } }, 401);
    }

    // Create session
    const token = generateToken();
    const session: Session = {
      id: `session_${Date.now()}`,
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      created_at: new Date(),
    };

    mockSessions.push(session);

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
    return c.json({ error: { message: 'Login failed' } }, 500);
  }
});

// Register endpoint
auth.post('/register', async (c) => {
  try {
    const { name, email, password, confirmPassword } = await c.req.json();

    if (password !== confirmPassword) {
      return c.json({ error: { message: 'Passwords do not match' } }, 400);
    }

    if (findUserByEmail(email)) {
      return c.json({ error: { message: 'Email already exists' } }, 400);
    }

    // Create user
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      password_hash: password, // In real app, this would be hashed
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockUsers.push(user);

    // Create session
    const token = generateToken();
    const session: Session = {
      id: `session_${Date.now()}`,
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      created_at: new Date(),
    };

    mockSessions.push(session);

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
    return c.json({ error: { message: 'Registration failed' } }, 500);
  }
});

// Google OAuth endpoint
auth.post('/google', async (c) => {
  try {
    const { googleId, email, name } = await c.req.json();

    if (!googleId || !email || !name) {
      return c.json({ error: { message: 'Missing required Google user data' } }, 400);
    }

    // Check if user already exists
    let user = findUserByEmail(email);

    if (!user) {
      // Create new user from Google data
      user = {
        id: `google_${googleId}`,
        email,
        name,
        password_hash: '', // No password for Google users
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockUsers.push(user);
    } else {
      // Update existing user info
      user.name = name;
      user.updated_at = new Date();
    }

    // Create session
    const token = generateToken();
    const session: Session = {
      id: `session_${Date.now()}`,
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      created_at: new Date(),
    };

    mockSessions.push(session);

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
    return c.json({ error: { message: 'Google authentication failed' } }, 500);
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
    const session = findSessionByToken(token);

    if (!session) {
      return c.json({ error: { message: 'Invalid or expired token' } }, 401);
    }

    const user = mockUsers.find(u => u.id === session.user_id);
    if (!user) {
      return c.json({ error: { message: 'User not found' } }, 404);
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    });
  } catch (error) {
    return c.json({ error: { message: 'Authentication failed' } }, 500);
  }
});

// Middleware to authenticate requests
export function authenticateUser() {
  return async (c: Context<{ Variables: Variables }>, next: Next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: { message: 'No token provided' } }, 401);
    }

    const token = authHeader.substring(7);
    const session = findSessionByToken(token);

    if (!session) {
      return c.json({ error: { message: 'Invalid or expired token' } }, 401);
    }

    const user = mockUsers.find(u => u.id === session.user_id);
    if (!user) {
      return c.json({ error: { message: 'User not found' } }, 404);
    }

    // Add user to context
    c.set('user', user);
    await next();
  };
}

export default auth;