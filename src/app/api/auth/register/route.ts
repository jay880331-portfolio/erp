import { NextRequest, NextResponse } from 'next/server';
import { RegisterTenantSchema } from '@/core/application/dtos/auth.dto';
import { RegisterTenantUseCase } from '@/core/application/use-cases/auth/RegisterTenantUseCase';
import { TenantRepository } from '@/core/infrastructure/database/repositories/TenantRepository';
import { UserRepository } from '@/core/infrastructure/database/repositories/UserRepository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = RegisterTenantSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Execute use case
    const tenantRepository = new TenantRepository();
    const userRepository = new UserRepository();
    const useCase = new RegisterTenantUseCase(tenantRepository, userRepository);
    
    const result = await useCase.execute(validationResult.data);

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}