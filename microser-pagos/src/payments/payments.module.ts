import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsRepository } from './repositories/payments.repository';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentsService } from './services/payments.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository],
  exports: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}

