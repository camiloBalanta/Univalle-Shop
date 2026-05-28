/**
 * TEST: UpdateRecommendationsUseCase
 *
 * Pruebas unitarias para el caso de uso de actualización de recomendaciones.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UpdateRecommendationsUseCase } from './update-recommendations.use-case';
import { RecommendationEntity } from '../entities/recommendation.entity';
import { ValidationException } from '../../../common/exceptions';
import {
  RECOMMENDATION_REPOSITORY_TOKEN,
  EXTERNAL_SERVICE_PORT_TOKEN,
} from '../ports/injection-tokens';

describe('UpdateRecommendationsUseCase', () => {
  let useCase: UpdateRecommendationsUseCase;
  let mockRepository: any;
  let mockExternalService: any;

  beforeEach(async () => {
    mockRepository = {
      exists: jest.fn(),
      delete: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    mockExternalService = {
      getUserOrders: jest.fn(),
      getCatalog: jest.fn(),
      getPopularProducts: jest.fn(),
      getSimilarUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRecommendationsUseCase,
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

    useCase = module.get<UpdateRecommendationsUseCase>(
      UpdateRecommendationsUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debería eliminar recomendaciones antiguas e ir a crear nuevas', async () => {
      // Arrange
      const userId = 'user123';
      mockRepository.exists.mockResolvedValue(true);
      mockRepository.delete.mockResolvedValue(undefined);
      mockRepository.findByUserId.mockResolvedValue(null);
      mockExternalService.getUserOrders.mockResolvedValue([]);
      mockExternalService.getCatalog.mockResolvedValue([]);
      mockExternalService.getPopularProducts.mockResolvedValue([]);
      mockExternalService.getSimilarUsers.mockResolvedValue([]);

      const newRecommendation = new RecommendationEntity(userId, []);
      mockRepository.create.mockResolvedValue(newRecommendation);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(mockRepository.exists).toHaveBeenCalledWith(userId);
      expect(mockRepository.delete).toHaveBeenCalledWith(userId);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debería crear nuevas recomendaciones si no existen antiguas', async () => {
      // Arrange
      const userId = 'user456';
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.findByUserId.mockResolvedValue(null);
      mockExternalService.getUserOrders.mockResolvedValue([]);
      mockExternalService.getCatalog.mockResolvedValue([]);
      mockExternalService.getPopularProducts.mockResolvedValue([]);
      mockExternalService.getSimilarUsers.mockResolvedValue([]);

      const newRecommendation = new RecommendationEntity(userId, []);
      mockRepository.create.mockResolvedValue(newRecommendation);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debería lanzar ValidationException si userId está vacío', async () => {
      // Act & Assert
      await expect(useCase.execute('')).rejects.toThrow(ValidationException);
    });

    it('debería lanzar ValidationException si userId no es string', async () => {
      // Act & Assert
      await expect(useCase.execute(null as any)).rejects.toThrow(
        ValidationException,
      );
    });
  });
});
