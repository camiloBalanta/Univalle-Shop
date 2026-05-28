/**
 * TEST: RecommendationController
 *
 * Pruebas unitarias para el controlador de recomendaciones.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationController } from './recommendation.controller';
import { RecommendationApplicationService } from '../../application/services/recommendation-application.service';
import { GetRecommendationsResponseDto } from '../../application/dto/get-recommendations.dto';
import { NotFoundException } from '../../../common/exceptions';

describe('RecommendationController', () => {
  let controller: RecommendationController;
  let mockApplicationService: any;

  beforeEach(async () => {
    mockApplicationService = {
      getRecommendations: jest.fn(),
      updateRecommendations: jest.fn(),
      deleteRecommendations: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationController],
      providers: [
        {
          provide: RecommendationApplicationService,
          useValue: mockApplicationService,
        },
      ],
    }).compile();

    controller = module.get<RecommendationController>(
      RecommendationController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecommendations', () => {
    it('debería retornar recomendaciones para un usuario', async () => {
      // Arrange
      const userId = 'user123';
      const mockResponse = new GetRecommendationsResponseDto(
        userId,
        [{ product: 'Laptop', score: 0.8 }],
        new Date(),
        new Date(),
      );
      mockApplicationService.getRecommendations.mockResolvedValue(
        mockResponse,
      );

      // Act
      const result = await controller.getRecommendations(userId);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockApplicationService.getRecommendations).toHaveBeenCalledWith(
        userId,
      );
    });

    it('debería lanzar error si el usuario no existe', async () => {
      // Arrange
      const userId = 'nonexistent';
      mockApplicationService.getRecommendations.mockRejectedValue(
        new NotFoundException(
          `No se encontraron recomendaciones para el usuario: ${userId}`,
        ),
      );

      // Act & Assert
      await expect(controller.getRecommendations(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateRecommendations', () => {
    it('debería actualizar recomendaciones para un usuario', async () => {
      // Arrange
      const userId = 'user456';
      const mockResponse = new GetRecommendationsResponseDto(
        userId,
        [{ product: 'Mouse', score: 0.7 }],
        new Date(),
        new Date(),
      );
      mockApplicationService.updateRecommendations.mockResolvedValue(
        mockResponse,
      );

      // Act
      const result = await controller.updateRecommendations(userId);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(
        mockApplicationService.updateRecommendations,
      ).toHaveBeenCalledWith(userId);
    });
  });

  describe('deleteRecommendations', () => {
    it('debería eliminar recomendaciones para un usuario', async () => {
      // Arrange
      const userId = 'user789';
      mockApplicationService.deleteRecommendations.mockResolvedValue(
        undefined,
      );

      // Act
      await controller.deleteRecommendations(userId);

      // Assert
      expect(
        mockApplicationService.deleteRecommendations,
      ).toHaveBeenCalledWith(userId);
    });

    it('debería lanzar error si no existen recomendaciones para eliminar', async () => {
      // Arrange
      const userId = 'nonexistent';
      mockApplicationService.deleteRecommendations.mockRejectedValue(
        new NotFoundException(
          `No se encontraron recomendaciones para el usuario: ${userId}`,
        ),
      );

      // Act & Assert
      await expect(
        controller.deleteRecommendations(userId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
