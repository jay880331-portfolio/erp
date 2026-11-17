import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema } from '@/core/application/dtos/auth.dto';
import { LoginUseCase } from '@/core/application/use-cases/auth/LoginUseCase';
import { UserRepository } from '@/core/infrastructure/database/repositories/UserRepository';
import { TenantRepository } from '@/core/infrastructure/database/repositories/TenantRepository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Execute use case
    const userRepository = new UserRepository();
    const tenantRepository = new TenantRepository();
    const useCase = new LoginUseCase(userRepository, tenantRepository);
    
    const result = await useCase.execute(validationResult.data);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json(
      { error: message },
      { status: 401 }
    );
  }
}