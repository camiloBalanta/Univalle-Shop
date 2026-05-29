import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ProductRating,
  ProductRatingDocument,
} from '../../infrastructure/adapters/persistence/product-rating.schema';
import {
  ProductRatingResponseDto,
  RateProductDto,
} from '../dto/rate-product.dto';
import type { IExternalServicePort } from '../../domain/ports/external-service.port';
import { EXTERNAL_SERVICE_PORT_TOKEN } from '../../domain/ports/injection-tokens';

@Injectable()
export class ProductRatingService {
  constructor(
    @InjectModel(ProductRating.name)
    private readonly ratingModel: Model<ProductRatingDocument>,
    @Inject(EXTERNAL_SERVICE_PORT_TOKEN)
    private readonly externalService: IExternalServicePort,
  ) {}

  async rateProduct(dto: RateProductDto): Promise<ProductRatingResponseDto> {
    if (!dto.userId?.trim()) {
      throw new BadRequestException('userId es requerido');
    }
    if (!dto.productId?.trim()) {
      throw new BadRequestException('productId es requerido');
    }
    if (!dto.productName?.trim()) {
      throw new BadRequestException('productName es requerido');
    }
    if (!Number.isFinite(dto.rating) || dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('rating debe estar entre 1 y 5');
    }

    const purchases = await this.externalService.getUserOrders(dto.userId);
    const hasPurchased = purchases.some(
      (purchase) => purchase.productId === dto.productId || purchase.product === dto.productName,
    );

    if (!hasPurchased) {
      throw new BadRequestException(
        'Solo usuarios que hayan comprado el producto pueden calificar',
      );
    }

    const rating = await this.ratingModel
      .findOneAndUpdate(
        { userId: dto.userId, productId: dto.productId },
        {
          userId: dto.userId,
          productId: dto.productId,
          productName: dto.productName,
          category: dto.category ?? 'General',
          rating: dto.rating,
          review: dto.review ?? undefined,
          updatedAt: new Date(),
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .lean()
      .exec();

    return this.toDto(rating);
  }

  async getUserRatings(userId: string): Promise<ProductRatingResponseDto[]> {
    const ratings = await this.ratingModel
      .find({ userId })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return ratings.map((rating) => this.toDto(rating));
  }

  async getPopularProducts(): Promise<
    Array<{ productId: string; product: string; popularity: number }>
  > {
    const ratings = await this.ratingModel
      .aggregate<{
        _id: string;
        product: string;
        averageRating: number;
        ratingCount: number;
      }>([
        {
          $group: {
            _id: '$productId',
            product: { $first: '$productName' },
            averageRating: { $avg: '$rating' },
            ratingCount: { $sum: 1 },
          },
        },
        { $sort: { averageRating: -1, ratingCount: -1 } },
      ])
      .exec();

    return ratings.map((rating) => ({
      productId: rating._id,
      product: rating.product,
      popularity: Number((rating.averageRating / 5).toFixed(2)),
    }));
  }

  private toDto(rating: ProductRating): ProductRatingResponseDto {
    return {
      userId: rating.userId,
      productId: rating.productId,
      productName: rating.productName,
      category: rating.category,
      rating: rating.rating,
      review: rating.review,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    };
  }
}
