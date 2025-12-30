import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { generateTokens, verifyRefreshToken, verifyAccessToken } from '@/lib/auth/jwt';
import {
  findUserByEmail, findUserById, createUser, saveRefreshToken, findRefreshToken, deleteRefreshToken, blacklistToken,
} from '@/lib/auth/db';
import { Role, RegisterRequest, LoginRequest, RefreshRequest, AuthResponse } from '@/lib/auth/types';
import { authenticateRequest } from '@/lib/auth/middleware';
import { setAuthCookies, clearAuthCookies, getRefreshToken, getAccessToken } from '@/lib/auth/cookies';
import { z } from 'zod';
import { sendEmail, getWelcomeEmailTemplate } from '@/lib/email';
import { notifyWelcome } from '@/lib/notifications';

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

  // Name, Email and Password format validation (using zod)


    /* For the password there will be:
      - at least 8 chars length
      - at least one uppercase, one special char, one number
      because if we make it too complicated, users are non-tech related so it will be inconveinient for them
     */

  try {
    const body: RegisterRequest = await request.json();

    const registerSchema = z.object({
      name: z.string().min(1, { message: 'Name is required' }),
      email: z.email({ message: 'Invalid email format' }),
      password: z.string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .refine((val) => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter' })
        .refine((val) => /[0-9]/.test(val), { message: 'Password must contain at least one number' })
        .refine((val) => /[!@#$%^&*()_\-+=\[{\]}:;"'<>,.?\/]/.test(val), { 
          message: 'Password must contain at least one special character' 
        }),
    });

    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      // Use .format() instead of treeifyError (which doesn't exist in current Zod versions)
      return NextResponse.json({ error: parseResult.error.format() }, { status: 400 });
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
      role: Role.USER,
    });

    // Generate tokens and save refresh token to DB
    const tokens = await generateAndSaveTokens(user);

    // Send welcome email (non-blocking)
    const welcomeEmail = getWelcomeEmailTemplate({
      name: user.name,
      email: user.email,
    });
    sendEmail({
      to: user.email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
    }).catch(err => console.error('Failed to send welcome email:', err));

    // Create welcome notification (non-blocking)
    notifyWelcome(user.id, user.name).catch(err => 
      console.error('Failed to create welcome notification:', err)
    );

    const responseBody: AuthResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      // Don't send tokens in response body for security (they're in httpOnly cookies)
      tokens: {
        accessToken: '',
        refreshToken: '',
      },
    };

    const res = NextResponse.json(responseBody, { status: 201 });
    // Set both tokens in httpOnly cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return res;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Register error:', error);
    }
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
      return NextResponse.json({ error: parseResult.error.format() }, { status: 400 });
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
    
    const responseBody: AuthResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      // Don't send tokens in response body for security (they're in httpOnly cookies)
      tokens: {
        accessToken: '',
        refreshToken: '',
      },
    };

    const res = NextResponse.json(responseBody, { status: 200 });
    // Set both tokens in httpOnly cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return res;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Logout user
async function handleLogout(request: NextRequest): Promise<NextResponse> {
  try {
    const res = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Get tokens from httpOnly cookies (secure)
    const refreshToken = getRefreshToken(request);
    const accessToken = getAccessToken(request);

    // If we have a refresh token, verify and delete it
    if (refreshToken) {
      const payload = verifyRefreshToken(refreshToken);
      if (payload) {
        // Check if token exists in database
        const tokenData = await findRefreshToken(refreshToken);
        if (tokenData) {
          await deleteRefreshToken(refreshToken);
        }
      }
    }

    // Blacklist access token if valid
    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      if (payload && payload.exp) {
        const expiresAt = new Date(payload.exp * 1000);
        await blacklistToken(accessToken, expiresAt);
      }
    }

    // Clear all auth cookies
    clearAuthCookies(res);
    return res;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Logout error:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Refresh access token
async function handleRefresh(request: NextRequest): Promise<NextResponse> {
  try {
    // Get refresh token from httpOnly cookie (secure)
    const refreshToken = getRefreshToken(request);

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Token existence check
    const tokenData = await findRefreshToken(refreshToken);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Token expiration check
    if (tokenData.expiresAt < new Date()) {
      await deleteRefreshToken(refreshToken);
      return NextResponse.json(
        { error: 'Refresh token has expired' },
        { status: 401 }
      );
    }

    // Delete old refresh token
    await deleteRefreshToken(refreshToken);

    // Generate and save new tokens
    const tokens = await generateAndSaveTokens({
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    const res = NextResponse.json(
      { message: 'Tokens refreshed successfully' },
      { status: 200 }
    );
    // Set both tokens in httpOnly cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return res;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Refresh error:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

    // Get full user data from database to include name
    const user = await findUserById(authResult.payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Me error:', error);
    }
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
