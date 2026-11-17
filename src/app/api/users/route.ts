import { NextRequest, NextResponse } from 'next/server';
import { CreateUserSchema } from '@/core/application/dtos/auth.dto';
import { CreateUserUseCase } from '@/core/application/use-cases/users/CreateUserUseCase';
import { UserRepository } from '@/core/infrastructure/database/repositories/UserRepository';
import { TenantRepository } from '@/core/infrastructure/database/repositories/TenantRepository';
import { requireAdmin } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const currentUser = await requireAdmin();

    const body = await request.json();
    
    // Validate input
    const validationResult = CreateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Execute use case
    const userRepository = new UserRepository();
    const tenantRepository = new TenantRepository();
    const useCase = new CreateUserUseCase(userRepository, tenantRepository);
    
    const user = await useCase.execute(validationResult.data, currentUser);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: unknown) {
    console.error('Create user error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to create user';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    // Check authentication
    const currentUser = await requireAdmin();

    const userRepository = new UserRepository();
    const users = await userRepository.findByTenantId(currentUser.tenantId);

    // Remove passwords from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);

    return NextResponse.json(usersWithoutPasswords);
  } catch (error: unknown) {
    console.error('Get users error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}