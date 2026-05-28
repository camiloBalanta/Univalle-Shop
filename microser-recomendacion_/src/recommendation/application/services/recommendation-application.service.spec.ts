/**
 * TEST: RecommendationApplicationService
 *
 * Pruebas unitarias para el servicio de aplicación.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationApplicationService } from './recommendation-application.service';
import { GetRecommendationsUseCase } from '../../domain/use-cases/get-recommendations.use-case';
import { UpdateRecommendationsUseCase } from '../../domain/use-cases/update-recommendations.use-case';
import { DeleteRecommendationsUseCase } from '../../domain/use-cases/delete-recommendations.use-case';
import { RecommendationEntity } from '../../domain/entities/recommendation.entity';
import { ValidationException } from '../../../common/exceptions';

describe('RecommendationApplicationService', () => {
  let service: RecommendationApplicationService;
  let mockGetUseCase: any;
  let mockUpdateUseCase: any;
  let mockDeleteUseCase: any;

  beforeEach(async () => {
    mockGetUseCase = {
      execute: jest.fn(),
    };
    mockUpdateUseCase = {
      execute: jest.fn(),
    };
    mockDeleteUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationApplicationService,
        {
          provide: GetRecommendationsUseCase,
          useValue: mockGetUseCase,
        },
        {
          provide: UpdateRecommendationsUseCase,
          useValue: mockUpdateUseCase,
        },
        {
          provide: DeleteRecommendationsUseCase,
          useValue: mockDeleteUseCase,
        },
      ],
    }).compile();

    service = module.get<RecommendationApplicationService>(
      RecommendationApplicationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecommendations', () => {
    it('debería retornar recomendaciones mapeadas a DTO', async () => {
      // Arrange
      const userId = 'user123';
      const entity = new RecommendationEntity(
        userId,
        [{ product: 'Laptop', score: 0.8 }],
      );
      mockGetUseCase.execute.mockResolvedValue(entity);

      // Act
      const result = await service.getRecommendations(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.recommendations).toHaveLength(1);
      expect(mockGetUseCase.execute).toHaveBeenCalledWith(userId);
    });

    it('debería propagar errores del use case', async () => {
      // Arrange
      const userId = 'user456';
      const error = new ValidationException('Error de validación');
      mockGetUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getRecommendations(userId)).rejects.toThrow(
        ValidationException,
      );
    });
  });

  describe('updateRecommendations', () => {
    it('debería actualizar y retornar recomendaciones', async () => {
      // Arrange
      const userId = 'user789';
      const entity = new RecommendationEntity(
        userId,
        [{ product: 'Mouse', score: 0.7 }],
      );
      mockUpdateUseCase.execute.mockResolvedValue(entity);

      // Act
      const result = await service.updateRecommendations(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(userId);
    });
  });

  describe('deleteRecommendations', () => {
    it('debería eliminar recomendaciones', async () => {
      // Arrange
      const userId = 'user999';
      mockDeleteUseCase.execute.mockResolvedValue(undefined);

      // Act
      await service.deleteRecommendations(userId);

      // Assert
      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith(userId);
    });

    it('debería propagar errores del use case', async () => {
      // Arrange
      const userId = 'nonexistent';
      const error = new Error('Not found');
      mockDeleteUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(service.deleteRecommendations(userId)).rejects.toThrow();
    });
  });
});
