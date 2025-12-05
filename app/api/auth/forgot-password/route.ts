import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { findUserByEmail } from '@/lib/auth/db';
import { hashPassword } from '@/lib/auth/password';
import { sendEmail, getPasswordResetEmailTemplate } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// POST - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const schema = z.object({
      email: z.string().email('Invalid email format'),
    });
    
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { email } = parsed.data;
    
    // Find user by email
    const user = await findUserByEmail(email);
    
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with this email, you will receive a password reset link.',
      });
    }
    
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });
    
    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });
    
    // Generate reset URL
    const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;
    
    // Send email
    const emailTemplate = getPasswordResetEmailTemplate({
      name: user.name,
      resetUrl,
      expiresIn: '1 hour',
    });
    
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });
    
    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// PUT - Reset password with token
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const schema = z.object({
      token: z.string().min(1, 'Token is required'),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .refine((val) => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
        .refine((val) => /[0-9]/.test(val), 'Password must contain at least one number')
        .refine((val) => /[!@#$%^&*()_\-+=\[{\]}:;"'<>,.?\/]/.test(val), 
          'Password must contain at least one special character'),
    });
    
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { token, password } = parsed.data;
    
    // Find valid token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });
    
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      );
    }
    
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'This reset link has already been used' },
        { status: 400 }
      );
    }
    
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This reset link has expired' },
        { status: 400 }
      );
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(password);
    
    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });
    
    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });
    
    return NextResponse.json({
      message: 'Password reset successfully. You can now log in with your new password.',
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

