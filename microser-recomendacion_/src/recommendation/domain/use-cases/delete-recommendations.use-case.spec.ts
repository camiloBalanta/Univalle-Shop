/**
 * TEST: DeleteRecommendationsUseCase
 *
 * Pruebas unitarias para el caso de uso de eliminación de recomendaciones.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DeleteRecommendationsUseCase } from './delete-recommendations.use-case';
import {
  NotFoundException,
  ValidationException,
} from '../../../common/exceptions';
import { RECOMMENDATION_REPOSITORY_TOKEN } from '../ports/injection-tokens';

describe('DeleteRecommendationsUseCase', () => {
  let useCase: DeleteRecommendationsUseCase;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      exists: jest.fn(),
      delete: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRecommendationsUseCase,
        {
          provide: RECOMMENDATION_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteRecommendationsUseCase>(
      DeleteRecommendationsUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debería eliminar recomendaciones si existen', async () => {
      // Arrange
      const userId = 'user123';
      mockRepository.exists.mockResolvedValue(true);
      mockRepository.delete.mockResolvedValue(undefined);

      // Act
      await useCase.execute(userId);

      // Assert
      expect(mockRepository.exists).toHaveBeenCalledWith(userId);
      expect(mockRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('debería lanzar NotFoundException si no existen recomendaciones', async () => {
      // Arrange
      const userId = 'user456';
      mockRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('debería lanzar ValidationException si userId está vacío', async () => {
      // Act & Assert
      await expect(useCase.execute('')).rejects.toThrow(ValidationException);
    });

    it('debería lanzar ValidationException si userId es null', async () => {
      // Act & Assert
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
