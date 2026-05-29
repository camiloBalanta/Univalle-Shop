/**
 * ADAPTADOR: RecommendationController (HTTP)
 *
 * Adaptador HTTP que expone los endpoints.
 * Convierte peticiones HTTP a casos de uso de dominio través de la capa de aplicación.
 * NO contiene lógica de negocio.
 */

import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Delete,
  HttpCode,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { RecommendationApplicationService } from '../../application/services/recommendation-application.service';
import { GetRecommendationsResponseDto } from '../../application/dto/get-recommendations.dto';
import { ValidateUserIdParam } from '../../../common/decorators/validate-user-id-param.decorator';
import {
  ProductRatingResponseDto,
  RateProductDto,
} from '../../application/dto/rate-product.dto';

@ApiTags('Recomendaciones')
@Controller('recommendations')
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(
    private readonly applicationService: RecommendationApplicationService,
  ) {}

  @Post('ratings')
  async rateProduct(
    @Body() dto: RateProductDto,
  ): Promise<ProductRatingResponseDto> {
    this.logger.log(`[HTTP] POST /recommendations/ratings`);
    return this.applicationService.rateProduct(dto);
  }

  @Get('ratings/:userId')
  async getUserRatings(
    @ValidateUserIdParam() userId: string,
  ): Promise<ProductRatingResponseDto[]> {
    this.logger.log(`[HTTP] GET /recommendations/ratings/${userId}`);
    return this.applicationService.getUserRatings(userId);
  }

  /**
   * GET /recommendations/:userId
   * Obtiene las recomendaciones para un usuario
   */
  @ApiOperation({
    summary: 'Obtener recomendaciones de un usuario',
    description:
      'Obtiene las recomendaciones personalizadas en cache o genera nuevas si no existen',
  })
  @ApiParam({
    name: 'userId',
    description:
      'ID del usuario (alfanumérico, guiones y guiones bajos permitidos)',
    type: 'string',
    example: 'user123',
  })
  @ApiOkResponse({
    description: 'Recomendaciones obtenidas exitosamente',
    type: GetRecommendationsResponseDto,
  })
  @Get(':userId')
  async getRecommendations(
    @ValidateUserIdParam() userId: string,
  ): Promise<GetRecommendationsResponseDto> {
    this.logger.log(`[HTTP] GET /recommendations/${userId}`);
    return this.applicationService.getRecommendations(userId);
  }

  /**
   * PUT /recommendations/:userId
   * Actualiza las recomendaciones para un usuario
   */
  @ApiOperation({
    summary: 'Actualizar recomendaciones de un usuario',
    description:
      'Elimina las recomendaciones antiguas y genera nuevas basadas en datos actuales',
  })
  @ApiParam({
    name: 'userId',
    description:
      'ID del usuario (alfanumérico, guiones y guiones bajos permitidos)',
    type: 'string',
    example: 'user123',
  })
  @ApiOkResponse({
    description: 'Recomendaciones actualizadas exitosamente',
    type: GetRecommendationsResponseDto,
  })
  @Put(':userId')
  async updateRecommendations(
    @ValidateUserIdParam() userId: string,
  ): Promise<GetRecommendationsResponseDto> {
    this.logger.log(`[HTTP] PUT /recommendations/${userId}`);
    return this.applicationService.updateRecommendations(userId);
  }

  /**
   * DELETE /recommendations/:userId
   * Elimina las recomendaciones de un usuario
   */
  @ApiOperation({
    summary: 'Eliminar recomendaciones de un usuario',
    description: 'Elimina todas las recomendaciones asociadas a un usuario',
  })
  @ApiParam({
    name: 'userId',
    description:
      'ID del usuario (alfanumérico, guiones y guiones bajos permitidos)',
    type: 'string',
    example: 'user123',
  })
  @ApiOkResponse({
    description: 'Recomendaciones eliminadas exitosamente (sin contenido)',
  })
  @ApiNotFoundResponse({
    description: 'No se encontraron recomendaciones para eliminar',
  })
  @Delete(':userId')
  @HttpCode(204)
  async deleteRecommendations(
    @ValidateUserIdParam() userId: string,
  ): Promise<void> {
    this.logger.log(`[HTTP] DELETE /recommendations/${userId}`);
    return this.applicationService.deleteRecommendations(userId);
  }
}
