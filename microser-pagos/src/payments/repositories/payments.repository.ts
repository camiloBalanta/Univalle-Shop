import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { PaymentRecord } from '../interfaces/payment.interface';

type PaymentPersistenceInput = Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async create(input: PaymentPersistenceInput): Promise<PaymentRecord> {
    const payment = await this.paymentModel.create(input);
    return this.toRecord(payment);
  }

  async upsertByTransactionId(
    transactionId: string,
    input: PaymentPersistenceInput,
  ): Promise<PaymentRecord> {
    const payment = await this.paymentModel
      .findOneAndUpdate(
        { transactionId },
        { $set: input },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .exec();
    return this.toRecord(payment);
  }

  async findAll(): Promise<PaymentRecord[]> {
    const payments = await this.paymentModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
    return payments.map((payment) => this.toRecord(payment));
  }

  async findById(id: string): Promise<PaymentRecord | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const payment = await this.paymentModel.findById(id).exec();
    return payment ? this.toRecord(payment) : null;
  }

  async findByTransactionId(transactionId: string): Promise<PaymentRecord | null> {
    const payment = await this.paymentModel.findOne({ transactionId }).exec();
    return payment ? this.toRecord(payment) : null;
  }

  async findByUserId(userId: string): Promise<PaymentRecord[]> {
    const payments = await this.paymentModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return payments.map((payment) => this.toRecord(payment));
  }

  async findByOrderId(orderId: string): Promise<PaymentRecord[]> {
    const payments = await this.paymentModel
      .find({ orderId })
      .sort({ createdAt: -1 })
      .exec();
    return payments.map((payment) => this.toRecord(payment));
  }

  async findByStatus(status: string): Promise<PaymentRecord[]> {
    const payments = await this.paymentModel
      .find({ status })
      .sort({ createdAt: -1 })
      .exec();
    return payments.map((payment) => this.toRecord(payment));
  }

  async update(id: string, input: Partial<PaymentPersistenceInput>): Promise<PaymentRecord | null> {
    const payment = await this.paymentModel
      .findByIdAndUpdate(id, { $set: input }, { new: true })
      .exec();
    return payment ? this.toRecord(payment) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.paymentModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private toRecord(payment: PaymentDocument): PaymentRecord {
    return {
      id: payment._id.toString(),
      transactionId: payment.transactionId,
      userId: payment.userId,
      orderId: payment.orderId,
      products: payment.products ?? [],
      subtotal: payment.subtotal,
      taxes: payment.taxes,
      totalPaid: payment.totalPaid,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      gatewayReference: payment.gatewayReference,
      status: payment.status,
      gatewayResponse: payment.gatewayResponse ?? {},
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
