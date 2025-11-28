import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { generateTokens, verifyRefreshToken, verifyAccessToken } from '@/lib/auth/jwt';
import {
  findUserByEmail, createUser, saveRefreshToken, findRefreshToken, deleteRefreshToken, blacklistToken,} from '@/lib/auth/db';
import { Role, RegisterRequest, LoginRequest, RefreshRequest, AuthResponse } from '@/lib/auth/types';
import { authenticateRequest } from '@/lib/auth/middleware';
import {z} from 'zod';

async function generateAndSaveTokens(user: { id: string; email: string; role: Role }) {
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await saveRefreshToken(user.id, tokens.refreshToken, expiresAt);
  return tokens;
}


// Register a new user
async function handleRegister(request: NextRequest): Promise<NextResponse> {
  try {
    const body: RegisterRequest = await request.json();

    // Name, Email and Password format validation (using zod)

    /* For the password there will be:
      - at least 8 chars length
      - at least one uppercase, one special char, one number
      because if we make it too complicated, users are non-tech related so it will be inconveinient for them
     */

    const registerSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.email({ message: 'Invalid email format' }),
    password: z.string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .refine((val) => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter' })
      .refine((val) => /[0-9]/.test(val), { message: 'Password must contain at least one number' })
      .refine((val) => /[!@#$%^&*()_\-+=\[{\]}:;"'<>,.?\/]/.test(val), { message: 'Password must contain at least one special character' }
      ),
   });

    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: z.treeifyError(parseResult.error) }, { status: 400 });
    }
    const validatedData = parseResult.data;

   // Check if user already exists
    const existingUser = await findUserByEmail(validatedData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(validatedData.password);

    const user = await createUser({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: Role.USER, // This is the default role
    });

    // Generate tokens and save refresh token to DB
    const tokens = await generateAndSaveTokens(user);

    const response: AuthResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Login user
async function handleLogin(request: NextRequest): Promise<NextResponse> {
  try {
    const body: LoginRequest = await request.json();

    const loginSchema = z.object({
      email: z.email({ message: 'Invalid email format' }),
      password: z.string().min(1, { message: 'Password is required' }),
    });

    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: z.treeifyError(parseResult.error) }, { status: 400 });
    }

    const validatedData = parseResult.data;

    // Find user by email
    const user = await findUserByEmail(validatedData.email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is suspended' },
        { status: 403 }
      );
    }
    // Verify password
    const isPasswordValid = await verifyPassword(user.password, validatedData.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens and save refresh token to DB
    const tokens = await generateAndSaveTokens(user);
    // Prepare response
    const response: AuthResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


// Logout user
async function handleLogout(request: NextRequest): Promise<NextResponse> {
  try {
    // Get refresh token from body or Authorization header
    const body = await request.json().catch(() => ({}));
    const refreshToken = body.refreshToken;

    if (!refreshToken) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // Try as refresh token first
        let payload = verifyRefreshToken(token);
        if (payload) {
          // When logging out, blacklist the access token so it can't be reused
          const accessToken = body.accessToken;
          if (accessToken) {
            const accessPayload = verifyAccessToken(accessToken);
            if (accessPayload) {
              const expiresAt = new Date(accessPayload.exp ? accessPayload.exp * 1000 : Date.now() + 15 * 60 * 1000);
              await blacklistToken(accessToken, expiresAt);
            }
          }
          // Delete refresh token
          await deleteRefreshToken(token);
          
          return NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
          );
        }
        
        // Try as access token
        payload = verifyAccessToken(token);
        if (payload) {
          // Just blacklist the access token
          const expiresAt = new Date(payload.exp ? payload.exp * 1000 : Date.now() + 15 * 60 * 1000);
          await blacklistToken(token, expiresAt);
          
          return NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Check if token exists in database
    const tokenData = await findRefreshToken(refreshToken);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Delete refresh token
    await deleteRefreshToken(refreshToken);

    // Blacklist access token if provided
    if (body.accessToken) {
      const accessPayload = verifyAccessToken(body.accessToken);
      if (accessPayload) {
        const expiresAt = new Date(accessPayload.exp ? accessPayload.exp * 1000 : Date.now() + 15 * 60 * 1000);
        await blacklistToken(body.accessToken, expiresAt);
      }
    }

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Refresh access token
async function handleRefresh(request: NextRequest): Promise<NextResponse> {
  try {
    const body: RefreshRequest = await request.json();

    const refreshSchema = z.object({
      refreshToken: z.string().min(1, { message: 'Refresh token is required' }),
    });

    const parseResult = refreshSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: z.treeifyError(parseResult.error) }, { status: 400 });
    }

    const { refreshToken } = parseResult.data;

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    // Token existence check
    const tokenData = await findRefreshToken(refreshToken);
    if (!tokenData) {
      return NextResponse.json({ error: 'Refresh token not found' }, { status: 401 });
    }

    // Token expiration check
    if (tokenData.expiresAt < new Date()) {
      await deleteRefreshToken(refreshToken);
      return NextResponse.json({ error: 'Refresh token has expired' }, { status: 401 });
    }

    // Delete old refresh token
    await deleteRefreshToken(refreshToken);

    // Generate and save new tokens
    const tokens = await generateAndSaveTokens({
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return NextResponse.json({ tokens }, { status: 200 });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// Get current user info
async function handleMe(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await authenticateRequest(request);
    
    if (!authResult.success || !authResult.payload) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Will be implemented later: Fetch user from database
    // just eg:
    /* const user = await findUserById(authResult.payload.userId);
    if (!user) {
     return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }*/

    return NextResponse.json(
      {
        user: {
          id: authResult.payload.userId,
          email: authResult.payload.email,
          role: authResult.payload.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Main route handler
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'register':
      return handleRegister(request);
    case 'login':
      return handleLogin(request);
    case 'logout':
      return handleLogout(request);
    case 'refresh':
      return handleRefresh(request);
    default:
      return NextResponse.json(
        { error: 'Invalid action. Use ?action=register|login|logout|refresh' },
        { status: 400 }
      );
  }
}

// GET handler for /me endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'me') {
    return handleMe(request);
  }

  return NextResponse.json(
    { error: 'Invalid action. Use ?action=me' },
    { status: 400 }
  );
}
