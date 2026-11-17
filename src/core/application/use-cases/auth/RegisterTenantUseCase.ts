import { ITenantRepository } from '@/core/domain/repositories/ITenantRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { RegisterTenantDto, AuthResponse } from '@/core/application/dtos/auth.dto';
import { hashPassword } from '@/core/infrastructure/auth/password';
import { generateToken } from '@/core/infrastructure/auth/jwt';
import { connectDB } from '@/core/infrastructure/database/mongoose/connection';

export class RegisterTenantUseCase {
  constructor(
    private tenantRepository: ITenantRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(dto: RegisterTenantDto): Promise<AuthResponse> {
    await connectDB();

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(dto.adminEmail);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Check if domain already exists
    if (dto.domain) {
      const existingTenant = await this.tenantRepository.findByDomain(dto.domain);
      if (existingTenant) {
        throw new Error('Domain already registered');
      }
    }

    // Create tenant
    const tenant = await this.tenantRepository.create({
      name: dto.tenantName,
      domain: dto.domain,
      subscription: {
        plan: 'basic',
        status: 'active',
        maxUsers: 3,
      },
    });

    // Create admin user
    const hashedPassword = await hashPassword(dto.adminPassword);
    const user = await this.userRepository.create({
      email: dto.adminEmail,
      password: hashedPassword,
      name: dto.adminName,
      role: 'admin',
      tenantId: tenant.id,
      isActive: true,
    });

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