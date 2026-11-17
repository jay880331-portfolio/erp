import { NextRequest, NextResponse } from 'next/server';
import { CreateUserSchema } from '@/core/application/dtos/auth.dto';
import { UserRepository } from '@/core/infrastructure/database/repositories/UserRepository';
import { requireAdmin } from '@/app/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAdmin();
    const body = await request.json();
    const { id } = await params;
    
    // For updates, password is optional
    const updateSchema = CreateUserSchema.partial({ password: true });
    const validationResult = updateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const userRepository = new UserRepository();
    
    // Check if user exists and belongs to the same tenant
    const existingUser = await userRepository.findById(id, currentUser.tenantId);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent self-demotion from admin
    if (existingUser.id === currentUser.userId && validationResult.data.role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot remove admin role from yourself' },
        { status: 400 }
      );
    }

    const updatedUser = await userRepository.update(id, currentUser.tenantId, validationResult.data);

    // Remove sensitive information before returning
    const { ...userWithoutPassword } = updatedUser;
    // @ts-expect-error - password is removed for security
    delete userWithoutPassword.password;

    return NextResponse.json(userWithoutPassword);
  } catch (error: unknown) {
    console.error('Update user error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to update user';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (message.includes('Only admins')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAdmin();
    const { id } = await params;

    const userRepository = new UserRepository();
    
    // Check if user exists and belongs to the same tenant
    const existingUser = await userRepository.findById(id, currentUser.tenantId);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (existingUser.id === currentUser.userId) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      );
    }

    // Check if this is the last admin
    const adminUsers = await userRepository.findByRole('admin', currentUser.tenantId);
    if (existingUser.role === 'admin' && adminUsers.length <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last admin user' },
        { status: 400 }
      );
    }

    await userRepository.delete(id, currentUser.tenantId);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    console.error('Delete user error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (message.includes('Only admins')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAdmin();
    const { id } = await params;

    const userRepository = new UserRepository();
    const user = await userRepository.findById(id, currentUser.tenantId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove sensitive information before returning
    const { ...userWithoutPassword } = user;
    // @ts-expect-error - password is removed for security
    delete userWithoutPassword.password;

    return NextResponse.json(userWithoutPassword);
  } catch (error: unknown) {
    console.error('Get user error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to fetch user';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}