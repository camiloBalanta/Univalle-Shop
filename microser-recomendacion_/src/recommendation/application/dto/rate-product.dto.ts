import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class RateProductDto {
  @IsString()
  userId: string;

  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  review?: string;
}

export interface ProductRatingResponseDto {
  userId: string;
  productId: string;
  productName: string;
  category?: string;
  rating: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}
