import { ICustomerRepository } from '@/core/domain/repositories/ICustomerRepository';
import { CreateCustomerDto } from '@/core/application/dtos/crm.dto';
import { Customer } from '@/core/domain/entities/Customer';
import { JwtPayload } from '@/core/infrastructure/auth/jwt';
import { connectDB } from '@/core/infrastructure/database/mongoose/connection';

export class CreateCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(dto: CreateCustomerDto, currentUser: JwtPayload): Promise<Customer> {
    await connectDB();

    // Check if current user is admin
    if (currentUser.role !== 'admin') {
      throw new Error('Only admins can create customers');
    }

    // Check if customer code already exists
    const existingCustomer = await this.customerRepository.findByCode(
      dto.code,
      currentUser.tenantId
    );
    
    if (existingCustomer) {
      throw new Error('Customer code already exists');
    }

    // Check if email already exists (if provided)
    if (dto.email) {
      const existingByEmail = await this.customerRepository.findByEmail(
        dto.email,
        currentUser.tenantId
      );
      
      if (existingByEmail) {
        throw new Error('Customer email already exists');
      }
    }

    // Create customer
    const customer = await this.customerRepository.create({
      code: dto.code,
      name: dto.name,
      type: dto.type,
      taxId: dto.taxId,
      email: dto.email,
      phone: dto.phone,
      address: dto.address || {},
      contacts: dto.contacts || [],
      creditLimit: dto.creditLimit,
      paymentTerms: dto.paymentTerms,
      tenantId: currentUser.tenantId,
      isActive: true,
    });

    return customer;
  }
}