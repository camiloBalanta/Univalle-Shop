import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsModule } from './payments/payments.module';

const env = (globalThis as { process?: { env?: Record<string, string> } })
  .process?.env;

@Module({
  imports: [
    MongooseModule.forRoot(
      env?.MONGO_URI ?? env?.PAYMENT_MONGO_URI ?? 'mongodb://localhost:27017/pagos',
      {
        dbName: env?.MONGO_DB_NAME ?? env?.PAYMENT_MONGO_DB_NAME ?? 'pagos',
      },
    ),
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
