import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaymentProductDto } from '../dto/payment-product.dto';
import { PaymentRecord } from '../interfaces/payment.interface';
import { PaymentStatus } from '../interfaces/payment-status.enum';
import { PaymentsRepository } from '../repositories/payments.repository';

type OrderResponse = {
  id: string;
  customerId: string;
  items: Array<{
    productId: string;
    name?: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
};

type NormalizedPaymentProduct = {
  productId: string;
  name?: string;
  quantity: number;
  price: number;
  subtotal: number;
};

type NormalizedPaymentInput = {
  transactionId: string;
  userId: string;
  orderId: string;
  products: NormalizedPaymentProduct[];
  subtotal: number;
  taxes: number;
  totalPaid: number;
  currency: string;
  paymentMethod: string;
  gatewayReference: string;
  status: PaymentStatus;
  gatewayResponse: Record<string, unknown>;
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly ordersServiceUrl =
    this.getEnv('ORDERS_SERVICE_HOST_PORT') || 'http://orders-service:3004';
  private readonly usersServiceUrl =
    this.getEnv('USERS_SERVICE_URL') || 'http://users-service:3000';
  private readonly internalServiceToken = this.getEnv('INTERNAL_SERVICE_TOKEN');

  constructor(private readonly repository: PaymentsRepository) {}

  async create(dto: CreatePaymentDto): Promise<PaymentRecord> {
    this.logger.log(
      `Pago recibido transactionId=${dto.transactionId ?? dto.paymentId ?? 'auto'} orderId=${dto.orderId}`,
    );
    const payment = await this.normalizePayment(dto);
    await this.ensureTransactionIsUnique(payment.transactionId);
    await this.validateOrderExists(payment.orderId);
    await this.validateUserExists(payment.userId);

    try {
      const created = await this.repository.create(payment);
      this.logPaymentStatus(created);
      this.logger.log(
        `Registro almacenado en MongoDB transactionId=${created.transactionId} id=${created.id}`,
      );
      return created;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          `Ya existe un pago con transactionId ${payment.transactionId}`,
        );
      }

      this.logger.error(
        `Error de persistencia transactionId=${payment.transactionId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async upsertFromGateway(dto: CreatePaymentDto): Promise<PaymentRecord> {
    const payment = await this.normalizePayment(dto);
    this.logger.log(
      `Actualizando pago desde pasarela transactionId=${payment.transactionId} status=${payment.status}`,
    );

    try {
      const saved = await this.repository.upsertByTransactionId(
        payment.transactionId,
        payment,
      );
      this.logPaymentStatus(saved);
      this.logger.log(
        `Registro almacenado en MongoDB transactionId=${saved.transactionId} id=${saved.id}`,
      );
      return saved;
    } catch (error) {
      this.logger.error(
        `Error de persistencia transactionId=${payment.transactionId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async findAll(): Promise<PaymentRecord[]> {
    return this.repository.findAll();
  }

  async findOne(idOrTransactionId: string): Promise<PaymentRecord> {
    const payment =
      (await this.repository.findById(idOrTransactionId)) ??
      (await this.repository.findByTransactionId(idOrTransactionId));

    if (!payment) {
      throw new NotFoundException(`Pago ${idOrTransactionId} no encontrado`);
    }

    return payment;
  }

  async findByUserId(userId: string): Promise<PaymentRecord[]> {
    return this.repository.findByUserId(userId);
  }

  async findByOrderId(orderId: string): Promise<PaymentRecord[]> {
    return this.repository.findByOrderId(orderId);
  }

  async findByStatus(status: string): Promise<PaymentRecord[]> {
    const normalizedStatus = this.normalizeStatus(status);
    return this.repository.findByStatus(normalizedStatus);
  }

  async update(id: string, dto: UpdatePaymentDto): Promise<PaymentRecord> {
    const existing = await this.findOne(id);
    const normalizedUpdate = await this.normalizePartialPayment(dto);

    this.logger.log(
      `Actualizacion de estado paymentId=${existing.id} transactionId=${existing.transactionId} status=${normalizedUpdate.status ?? existing.status}`,
    );

    const updated = await this.repository.update(existing.id, normalizedUpdate);
    if (!updated) {
      throw new NotFoundException(`Pago ${id} no encontrado`);
    }

    this.logPaymentStatus(updated);
    return updated;
  }

  async delete(id: string): Promise<{ deleted: true }> {
    const existing = await this.findOne(id);
    const deleted = await this.repository.delete(existing.id);
    if (!deleted) {
      throw new NotFoundException(`Pago ${id} no encontrado`);
    }
    this.logger.warn(
      `Pago eliminado por administracion id=${existing.id} transactionId=${existing.transactionId}`,
    );
    return { deleted: true };
  }

  async getOrder(orderId: string): Promise<OrderResponse> {
    const response = await fetch(`${this.ordersServiceUrl}/orders/${orderId}`);
    if (!response.ok) {
      throw new NotFoundException(`Orden ${orderId} no encontrada`);
    }
    return (await response.json()) as OrderResponse;
  }

  private async normalizePayment(
    dto: CreatePaymentDto,
  ): Promise<NormalizedPaymentInput> {
    if (!dto.orderId) {
      throw new BadRequestException('orderId es obligatorio');
    }

    const order = await this.tryGetOrder(dto.orderId);
    const products = this.normalizeProducts(dto.products ?? order?.items ?? []);
    const subtotal = this.normalizeMoney(
      dto.subtotal ?? this.calculateSubtotal(products),
      'subtotal',
      true,
    );
    const taxes = this.normalizeMoney(dto.taxes ?? 0, 'taxes', true);
    const totalPaid = this.normalizeMoney(
      dto.totalPaid ?? dto.amount ?? subtotal + taxes,
      'totalPaid',
    );
    const userId = dto.userId ?? dto.customerId ?? order?.customerId;

    if (!userId) {
      throw new BadRequestException('userId o customerId es obligatorio');
    }

    const transactionId = dto.transactionId ?? dto.paymentId ?? `PAY-${Date.now()}`;
    const status = this.normalizeStatus(dto.status ?? PaymentStatus.PENDING);

    return {
      transactionId,
      userId,
      orderId: dto.orderId,
      products,
      subtotal,
      taxes,
      totalPaid,
      currency: (dto.currency ?? 'COP').toUpperCase(),
      paymentMethod: dto.paymentMethod ?? 'SIMULATED',
      gatewayReference: dto.gatewayReference ?? transactionId,
      status,
      gatewayResponse: dto.gatewayResponse ?? {},
    };
  }

  private async normalizePartialPayment(
    dto: UpdatePaymentDto,
  ): Promise<Partial<NormalizedPaymentInput>> {
    const update: Partial<NormalizedPaymentInput> = {};

    if (dto.userId ?? dto.customerId) {
      update.userId = dto.userId ?? dto.customerId;
      await this.validateUserExists(update.userId);
    }
    if (dto.orderId) {
      update.orderId = dto.orderId;
      await this.validateOrderExists(dto.orderId);
    }
    if (dto.products) {
      update.products = this.normalizeProducts(dto.products);
      update.subtotal = this.calculateSubtotal(update.products);
    }
    if (dto.subtotal != null) {
      update.subtotal = this.normalizeMoney(dto.subtotal, 'subtotal', true);
    }
    if (dto.taxes != null) {
      update.taxes = this.normalizeMoney(dto.taxes, 'taxes', true);
    }
    if (dto.totalPaid != null || dto.amount != null) {
      update.totalPaid = this.normalizeMoney(
        dto.totalPaid ?? dto.amount,
        'totalPaid',
      );
    }
    if (dto.currency) {
      update.currency = dto.currency.toUpperCase();
    }
    if (dto.paymentMethod) {
      update.paymentMethod = dto.paymentMethod;
    }
    if (dto.gatewayReference) {
      update.gatewayReference = dto.gatewayReference;
    }
    if (dto.status) {
      update.status = this.normalizeStatus(dto.status);
    }
    if (dto.gatewayResponse) {
      update.gatewayResponse = dto.gatewayResponse;
    }

    return update;
  }

  private normalizeProducts(products: PaymentProductDto[]): NormalizedPaymentProduct[] {
    return products.map((product) => {
      if (!product.productId) {
        throw new BadRequestException('Cada producto debe tener productId');
      }
      if (!Number.isInteger(product.quantity) || product.quantity <= 0) {
        throw new BadRequestException(
          `Cantidad invalida para producto ${product.productId}`,
        );
      }
      if (!Number.isFinite(product.price) || product.price < 0) {
        throw new BadRequestException(
          `Precio invalido para producto ${product.productId}`,
        );
      }

      return {
        productId: product.productId,
        name: product.name,
        quantity: product.quantity,
        price: product.price,
        subtotal: this.normalizeMoney(
          product.subtotal ?? product.price * product.quantity,
          `subtotal producto ${product.productId}`,
          true,
        ),
      };
    });
  }

  private calculateSubtotal(products: NormalizedPaymentProduct[]): number {
    return products.reduce((total, product) => total + product.subtotal, 0);
  }

  private normalizeMoney(
    value: number | undefined,
    field: string,
    allowZero = false,
  ): number {
    if (value == null || !Number.isFinite(value)) {
      throw new BadRequestException(`${field} debe ser numerico`);
    }
    if (allowZero ? value < 0 : value <= 0) {
      throw new BadRequestException(
        `${field} debe ser ${allowZero ? 'mayor o igual a cero' : 'mayor a cero'}`,
      );
    }
    return Number(value.toFixed(2));
  }

  private normalizeStatus(status: string | PaymentStatus): PaymentStatus {
    const normalized = String(status).toUpperCase();
    if (normalized === 'PAID') {
      return PaymentStatus.APPROVED;
    }
    if (!Object.values(PaymentStatus).includes(normalized as PaymentStatus)) {
      throw new BadRequestException(`Estado de pago invalido: ${status}`);
    }
    return normalized as PaymentStatus;
  }

  private async ensureTransactionIsUnique(transactionId: string): Promise<void> {
    const existing = await this.repository.findByTransactionId(transactionId);
    if (existing) {
      throw new ConflictException(
        `Ya existe un pago con transactionId ${transactionId}`,
      );
    }
  }

  private async validateOrderExists(orderId: string): Promise<void> {
    await this.getOrder(orderId);
  }

  private async tryGetOrder(orderId: string): Promise<OrderResponse | null> {
    try {
      return await this.getOrder(orderId);
    } catch (error) {
      this.logger.warn(
        `No se pudo cargar orden ${orderId} para enriquecer el pago: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private async validateUserExists(userId?: string): Promise<void> {
    if (!userId || userId === 'guest') {
      return;
    }

    try {
      const headers: Record<string, string> = {};
      if (this.internalServiceToken) {
        headers.Authorization = `Bearer ${this.internalServiceToken}`;
      }

      const response = await fetch(`${this.usersServiceUrl}/usuarios/${userId}`, {
        headers,
      });

      if (response.status === 404) {
        throw new NotFoundException(`Usuario ${userId} no encontrado`);
      }

      if (response.status === 401 || response.status === 403) {
        this.logger.warn(
          `No se pudo validar usuario ${userId}: el servicio requiere autorizacion interna`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.warn(
        `No se pudo validar usuario ${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private logPaymentStatus(payment: PaymentRecord): void {
    if (
      payment.status === PaymentStatus.APPROVED ||
      payment.status === PaymentStatus.COMPLETED
    ) {
      this.logger.log(
        `Pago aprobado transactionId=${payment.transactionId} orderId=${payment.orderId} total=${payment.totalPaid}`,
      );
      return;
    }

    if (payment.status === PaymentStatus.REJECTED) {
      this.logger.warn(
        `Pago rechazado transactionId=${payment.transactionId} orderId=${payment.orderId}`,
      );
      return;
    }

    this.logger.log(
      `Pago registrado transactionId=${payment.transactionId} status=${payment.status}`,
    );
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }

  private getEnv(key: string): string | undefined {
    return (globalThis as { process?: { env?: Record<string, string> } })
      .process?.env?.[key];
  }
}
