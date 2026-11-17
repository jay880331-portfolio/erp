import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ITenantRepository } from '@/core/domain/repositories/ITenantRepository';
import { CreateUserDto } from '@/core/application/dtos/auth.dto';
import { hashPassword } from '@/core/infrastructure/auth/password';
import { User } from '@/core/domain/entities/User';
import { JwtPayload } from '@/core/infrastructure/auth/jwt';
import { connectDB } from '@/core/infrastructure/database/mongoose/connection';

export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tenantRepository: ITenantRepository
  ) {}

  async execute(dto: CreateUserDto, currentUser: JwtPayload): Promise<User> {
    await connectDB();

    // Check if current user is admin
    if (currentUser.role !== 'admin') {
      throw new Error('Only admins can create users');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Get tenant to check user limits
    const tenant = await this.tenantRepository.findById(currentUser.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Count existing users for the tenant
    const userCount = await this.userRepository.countByTenantIdAndRole(
      currentUser.tenantId,
      'user'
    );
    const adminCount = await this.userRepository.countByTenantIdAndRole(
      currentUser.tenantId,
      'admin'
    );

    // Check user limits based on role
    if (dto.role === 'admin' && adminCount >= 1) {
      throw new Error('Maximum number of admins (1) reached for this tenant');
    }

    if (dto.role === 'user' && userCount >= 2) {
      throw new Error('Maximum number of users (2) reached for this tenant');
    }

    // Create user
    const hashedPassword = await hashPassword(dto.password);
    const user = await this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: dto.role,
      tenantId: currentUser.tenantId,
      isActive: true,
    });

    return user;
  }
}