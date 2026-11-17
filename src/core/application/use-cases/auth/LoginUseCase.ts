import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ITenantRepository } from '@/core/domain/repositories/ITenantRepository';
import { LoginDto, AuthResponse } from '@/core/application/dtos/auth.dto';
import { comparePassword } from '@/core/infrastructure/auth/password';
import { generateToken } from '@/core/infrastructure/auth/jwt';
import { connectDB } from '@/core/infrastructure/database/mongoose/connection';

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tenantRepository: ITenantRepository
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponse> {
    await connectDB();

    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValidPassword = await comparePassword(dto.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is disabled');
    }

    // Get tenant
    const tenant = await this.tenantRepository.findById(user.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Check tenant status
    if (tenant.subscription.status !== 'active') {
      throw new Error('Tenant subscription is not active');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Generate token
    const token = generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
      },
    };
  }
}