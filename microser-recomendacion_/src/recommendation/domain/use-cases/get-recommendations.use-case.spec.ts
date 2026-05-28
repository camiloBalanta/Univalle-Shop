/**
 * TEST: GetRecommendationsUseCase
 *
 * Pruebas unitarias para el caso de uso de obtención de recomendaciones.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { GetRecommendationsUseCase } from './get-recommendations.use-case';
import { RecommendationEntity } from '../entities/recommendation.entity';
import { ValidationException } from '../../../common/exceptions';
import {
  RECOMMENDATION_REPOSITORY_TOKEN,
  EXTERNAL_SERVICE_PORT_TOKEN,
} from '../ports/injection-tokens';

describe('GetRecommendationsUseCase', () => {
  let useCase: GetRecommendationsUseCase;
  let mockRepository: any;
  let mockExternalService: any;

  beforeEach(async () => {
    // Crear mocks
    mockRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      exists: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockExternalService = {
      getUserOrders: jest.fn(),
      getCatalog: jest.fn(),
      getPopularProducts: jest.fn(),
      getSimilarUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRecommendationsUseCase,
        {
          provide: RECOMMENDATION_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
        {
          provide: EXTERNAL_SERVICE_PORT_TOKEN,
          useValue: mockExternalService,
        },
      ],
    }).compile();

    useCase = module.get<GetRecommendationsUseCase>(GetRecommendationsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debería retornar recomendaciones en cache si existen', async () => {
      // Arrange
      const userId = 'user123';
      const cachedRecommendation = new RecommendationEntity(userId, [
        { product: 'Laptop', score: 0.8 },
      ]);

      mockRepository.findByUserId.mockResolvedValue(cachedRecommendation);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result).toEqual(cachedRecommendation);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockExternalService.getUserOrders).not.toHaveBeenCalled();
    });

    it('debería generar nuevas recomendaciones si no existen en cache', async () => {
      // Arrange
      const userId = 'user456';
      const mockOrders = [
        { product: 'Laptop', category: 'tech', date: new Date() },
      ];
      const mockCatalog = [
        { product: 'Laptop', category: 'tech' },
        { product: 'Mouse', category: 'tech' },
      ];
      const mockPopular = [{ product: 'Mouse', popularity: 0.7 }];
      const mockSimilarUsers = [{ purchases: ['Mouse'] }];

      mockRepository.findByUserId.mockResolvedValue(null);
      mockExternalService.getUserOrders.mockResolvedValue(mockOrders);
      mockExternalService.getCatalog.mockResolvedValue(mockCatalog);
      mockExternalService.getPopularProducts.mockResolvedValue(mockPopular);
      mockExternalService.getSimilarUsers.mockResolvedValue(mockSimilarUsers);

      const newRecommendation = new RecommendationEntity(userId, [
        { product: 'Mouse', score: 0.65 },
      ]);
      mockRepository.create.mockResolvedValue(newRecommendation);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockExternalService.getUserOrders).toHaveBeenCalledWith(userId);
    });

    it('debería lanzar ValidationException si userId está vacío', async () => {
      // Act & Assert
      await expect(useCase.execute('')).rejects.toThrow(ValidationException);
      await expect(useCase.execute(null as any)).rejects.toThrow(
        ValidationException,
      );
    });

    it('debería lanzar ValidationException si userId no es string', async () => {
      // Act & Assert
      await expect(useCase.execute(123 as any)).rejects.toThrow(
        ValidationException,
      );
    });
  });
});
