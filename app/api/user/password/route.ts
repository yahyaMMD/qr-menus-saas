import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserById, updateUser, deleteAllUserRefreshTokens } from '@/lib/auth/db';

// PATCH /api/user/password - Change user password
export async function PATCH(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success || !authResult.payload) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    );
  }

  const user = await findUserById(authResult.payload.userId);
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All password fields are required' },
        { status: 400 }
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Validate new password matches confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

    if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecialChar) {
      return NextResponse.json(
        { 
          error: 'Password must be at least 8 characters and contain uppercase, number, and special character' 
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await updateUser(user.id, { password: hashedPassword });

    // Optionally: Invalidate all refresh tokens to log out other sessions
    await deleteAllUserRefreshTokens(user.id);

    return NextResponse.json({
      message: 'Password changed successfully. Please log in again.',
    });
  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}

