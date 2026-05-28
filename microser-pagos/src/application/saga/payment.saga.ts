import { Injectable } from '@nestjs/common';
import { PaymentRepositoryImpl } from '../../infrastructure/persistence/payment.repository.impl';
import { PaymentGatewayService } from '../services/payment-gateway.service';
import { NotificationService } from '../services/notification.service';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentCreatedEvent } from '../../domain/events/payment-created.event';
import { PaymentFailedEvent } from '../../domain/events/payment-failed.event';
import { PaymentCompensatedEvent } from '../../domain/events/payment-compensated.event';

export enum SagaStatus {
  STARTED = 'STARTED',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  NOTIFICATION_SENT = 'NOTIFICATION_SENT',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
}

export interface SagaState {
  sagaId: string;
  paymentId: string;
  status: SagaStatus;
  steps: SagaStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SagaStep {
  stepId: string;
  name: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'COMPENSATED';
  executedAt?: Date;
  compensatedAt?: Date;
  error?: string;
}

@Injectable()
export class PaymentSaga {
  private sagas = new Map<string, SagaState>();

  constructor(
    private readonly paymentRepository: PaymentRepositoryImpl,
    private readonly paymentGateway: PaymentGatewayService,
    private readonly notificationService: NotificationService,
  ) {}

  async start(payment: Payment): Promise<SagaState> {
    const sagaId = `saga_${payment.id}_${Date.now()}`;
    const sagaState: SagaState = {
      sagaId,
      paymentId: payment.id,
      status: SagaStatus.STARTED,
      steps: [
        { stepId: '1', name: 'CREATE_PAYMENT', status: 'PENDING' },
        { stepId: '2', name: 'PROCESS_PAYMENT', status: 'PENDING' },
        { stepId: '3', name: 'SEND_NOTIFICATION', status: 'PENDING' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sagas.set(sagaId, sagaState);

    try {
      await this.executeStep(sagaState, 'CREATE_PAYMENT');
      await this.executeStep(sagaState, 'PROCESS_PAYMENT');
      await this.executeStep(sagaState, 'SEND_NOTIFICATION');

      sagaState.status = SagaStatus.COMPLETED;
      sagaState.updatedAt = new Date();

      return sagaState;
    } catch (error) {
      await this.compensate(sagaState, error.message);
      throw error;
    }
  }

  private async executeStep(sagaState: SagaState, stepName: string): Promise<void> {
    const step = sagaState.steps.find(s => s.name === stepName);
    if (!step) return;

    try {
      step.status = 'COMPLETED';
      step.executedAt = new Date();

      switch (stepName) {
        case 'CREATE_PAYMENT':
          sagaState.status = SagaStatus.PAYMENT_PROCESSING;
          const payment = await this.paymentRepository.findById(sagaState.paymentId);
          if (!payment) throw new Error('Payment not found');
          break;

        case 'PROCESS_PAYMENT':
          sagaState.status = SagaStatus.PAYMENT_COMPLETED;
          const paymentToProcess = await this.paymentRepository.findById(sagaState.paymentId);
          if (!paymentToProcess) throw new Error('Payment not found');
          this.paymentGateway.process(paymentToProcess);
          paymentToProcess.status = 'confirmed';
          await this.paymentRepository.update(paymentToProcess);
          break;

        case 'SEND_NOTIFICATION':
          sagaState.status = SagaStatus.NOTIFICATION_SENT;
          this.notificationService.notify(sagaState.paymentId, 'payment.completed');
          break;
      }

      sagaState.updatedAt = new Date();
    } catch (error) {
      step.status = 'FAILED';
      step.error = error.message;
      throw error;
    }
  }

  private async compensate(sagaState: SagaState, errorMessage: string): Promise<void> {
    sagaState.status = SagaStatus.COMPENSATING;

    // Compensate in reverse order
    const stepsToCompensate = sagaState.steps
      .filter(step => step.status === 'COMPLETED')
      .reverse();

    for (const step of stepsToCompensate) {
      try {
        await this.compensateStep(sagaState, step.name);
        step.status = 'COMPENSATED';
        step.compensatedAt = new Date();
      } catch (compensateError) {
        // Log compensation failure but continue
        console.error(`Failed to compensate step ${step.name}:`, compensateError);
      }
    }

    sagaState.status = SagaStatus.COMPENSATED;
    sagaState.updatedAt = new Date();

    // Emit compensation event
    const compensationEvent = new PaymentCompensatedEvent(sagaState.paymentId, 'cancel');
    console.log('Compensation completed:', compensationEvent);
  }

  private async compensateStep(sagaState: SagaState, stepName: string): Promise<void> {
    switch (stepName) {
      case 'CREATE_PAYMENT':
        // Nothing to compensate for creation
        break;

      case 'PROCESS_PAYMENT':
        // Cancel the payment
        const payment = await this.paymentRepository.findById(sagaState.paymentId);
        if (payment) {
          payment.status = 'cancelled';
          await this.paymentRepository.update(payment);
        }
        break;

      case 'SEND_NOTIFICATION':
        // Send failure notification
        this.notificationService.notify(sagaState.paymentId, 'payment.failed');
        break;
    }
  }

  getSagaState(sagaId: string): SagaState | undefined {
    return this.sagas.get(sagaId);
  }

  getAllSagas(): SagaState[] {
    return Array.from(this.sagas.values());
  }
}

