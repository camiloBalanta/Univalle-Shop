import { Injectable } from '@nestjs/common';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentRepository } from '../../domain/repositories/payment.repository';

@Injectable()
export class PaymentRepositoryImpl implements PaymentRepository {
  private readonly storage = new Map<string, Payment>();

  async create(payment: Payment): Promise<Payment> {
    this.storage.set(payment.id, payment);
    return payment;
  }

  async findById(paymentId: string): Promise<Payment | null> {
    return this.storage.get(paymentId) ?? null;
  }

  async update(payment: Payment): Promise<Payment> {
    this.storage.set(payment.id, payment);
    return payment;
  }
}
