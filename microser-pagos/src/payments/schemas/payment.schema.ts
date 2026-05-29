import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PaymentStatus } from '../interfaces/payment-status.enum';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ _id: false })
export class PaymentProduct {
  @Prop({ required: true, trim: true })
  productId: string;

  @Prop({ trim: true })
  name?: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  subtotal: number;
}

export const PaymentProductSchema =
  SchemaFactory.createForClass(PaymentProduct);

@Schema({ collection: 'payments', timestamps: true })
export class Payment {
  @Prop({ required: true, unique: true, index: true, trim: true })
  transactionId: string;

  @Prop({ required: true, index: true, trim: true })
  userId: string;

  @Prop({ required: true, index: true, trim: true })
  orderId: string;

  @Prop({ type: [PaymentProductSchema], default: [] })
  products: PaymentProduct[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0, default: 0 })
  taxes: number;

  @Prop({ required: true, min: 0 })
  totalPaid: number;

  @Prop({ required: true, uppercase: true, trim: true, default: 'COP' })
  currency: string;

  @Prop({ required: true, trim: true, default: 'SIMULATED' })
  paymentMethod: string;

  @Prop({ required: true, index: true, trim: true })
  gatewayReference: string;

  @Prop({
    required: true,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
    index: true,
  })
  status: PaymentStatus;

  @Prop({ type: Object, default: {} })
  gatewayResponse: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ transactionId: 1 }, { unique: true });
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

