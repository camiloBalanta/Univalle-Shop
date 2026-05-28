/**
 * DTO: UpdateRecommendationsRequest
 *
 * DTO para validar la solicitud de actualización de recomendaciones.
 */

import { IsNotEmpty } from 'class-validator';
import { IsValidUserId } from '../../../common/validators/is-valid-user-id.validator';

export class UpdateRecommendationsRequestDto {
  @IsValidUserId({ message: 'El userId tiene un formato inválido' })
  @IsNotEmpty({ message: 'El userId es requerido' })
  userId!: string;
}
