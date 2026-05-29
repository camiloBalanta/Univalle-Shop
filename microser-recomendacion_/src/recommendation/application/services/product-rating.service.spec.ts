import { BadRequestException } from '@nestjs/common';
import { ProductRatingService } from './product-rating.service';
import type { IExternalServicePort } from '../../domain/ports/external-service.port';
import type { Model } from 'mongoose';
import type { ProductRatingDocument } from '../../infrastructure/adapters/persistence/product-rating.schema';

describe('ProductRatingService', () => {
  let service: ProductRatingService;
  let mockRatingModel: any;
  let mockExternalService: jest.Mocked<IExternalServicePort>;

  beforeEach(() => {
    const mockQuery = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        userId: 'user123',
        productId: 'prod-001',
        productName: 'Producto A',
        category: 'General',
        rating: 5,
        review: 'Excelente producto',
        createdAt: new Date('2026-05-28T00:00:00.000Z'),
        updatedAt: new Date('2026-05-28T00:00:00.000Z'),
      }),
    };

    mockRatingModel = {
      findOneAndUpdate: jest.fn().mockReturnValue(mockQuery),
      find: jest.fn().mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) }),
    };

    mockExternalService = {
      getUserOrders: jest.fn(),
      getCatalog: jest.fn(),
      getPopularProducts: jest.fn(),
      getSimilarUsers: jest.fn(),
    } as unknown as jest.Mocked<IExternalServicePort>;

    service = new ProductRatingService(mockRatingModel as unknown as Model<ProductRatingDocument>, mockExternalService);
  });

  it('debe guardar una calificación y reseña cuando el producto fue comprado', async () => {
    mockExternalService.getUserOrders.mockResolvedValue([
      {
        productId: 'prod-001',
        product: 'Producto A',
        category: 'General',
        date: new Date('2026-05-27T00:00:00.000Z'),
      },
    ]);

    const result = await service.rateProduct({
      userId: 'user123',
      productId: 'prod-001',
      productName: 'Producto A',
      category: 'General',
      rating: 5,
      review: 'Excelente producto',
    });

    expect(mockExternalService.getUserOrders).toHaveBeenCalledWith('user123');
    expect(mockRatingModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'user123', productId: 'prod-001' },
      expect.objectContaining({
        userId: 'user123',
        productId: 'prod-001',
        productName: 'Producto A',
        category: 'General',
        rating: 5,
        review: 'Excelente producto',
      }),
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    expect(result.review).toBe('Excelente producto');
  });

  it('debe rechazar el rating si el usuario no compró el producto', async () => {
    mockExternalService.getUserOrders.mockResolvedValue([
      {
        productId: 'prod-002',
        product: 'Producto B',
        category: 'General',
        date: new Date('2026-05-27T00:00:00.000Z'),
      },
    ]);

    await expect(
      service.rateProduct({
        userId: 'user123',
        productId: 'prod-001',
        productName: 'Producto A',
        category: 'General',
        rating: 4,
        review: 'No lo he comprado',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
