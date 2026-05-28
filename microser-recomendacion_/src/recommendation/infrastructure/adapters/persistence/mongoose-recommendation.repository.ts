/**
 * ADAPTADOR: Mongoose Repository
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { IRecommendationRepository } from '../../../domain/ports/recommendation.repository.interface';
import { RecommendationEntity } from '../../../domain/entities/recommendation.entity';
import { NotFoundException } from '../../../../common/exceptions';
import {
  RecommendationDocument,
  Recommendation,
} from './recommendation.schema';

@Injectable()
export class MongooseRecommendationRepository implements IRecommendationRepository {
  private readonly logger = new Logger(MongooseRecommendationRepository.name);

  constructor(
    @InjectModel(Recommendation.name)
    private readonly model: Model<RecommendationDocument>,
  ) {}

  async findByUserId(userId: string): Promise<RecommendationEntity | null> {
    this.logger.debug(
      `[Adaptador] Buscando recomendaciones en DB para usuario: ${userId}`,
    );

    const doc = await this.model.findOne({ userId }).exec();

    if (!doc) {
      this.logger.debug(
        `[Adaptador] No se encontraron recomendaciones para: ${userId}`,
      );
      return null;
    }

    return this.mapDocumentToEntity(doc);
  }

  async findAll(): Promise<RecommendationEntity[]> {
    this.logger.debug(`[Adaptador] Obteniendo todas las recomendaciones`);

    const docs = await this.model.find().exec();
    return docs.map((doc) => this.mapDocumentToEntity(doc));
  }

  async create(
    recommendation: RecommendationEntity,
  ): Promise<RecommendationEntity> {
    this.logger.debug(
      `[Adaptador] Creando recomendación para usuario: ${recommendation.userId}`,
    );

    const doc = new this.model({
      userId: recommendation.userId,
      recommendations: recommendation.recommendations,
      createdAt: recommendation.createdAt,
      updatedAt: recommendation.updatedAt,
    });

    const saved = await doc.save();
    this.logger.debug(`[Adaptador] Recomendación creada con ID: ${saved._id}`);

    return this.mapDocumentToEntity(saved);
  }

  async update(
    recommendation: RecommendationEntity,
  ): Promise<RecommendationEntity> {
    this.logger.debug(
      `[Adaptador] Actualizando recomendación para usuario: ${recommendation.userId}`,
    );

    const updated = await this.model
      .findOneAndUpdate(
        { userId: recommendation.userId },
        {
          recommendations: recommendation.recommendations,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      this.logger.warn(
        `[Adaptador] No se pudo actualizar recomendación para usuario: ${recommendation.userId}`,
      );
      throw new NotFoundException(
        `No se encontraron recomendaciones para actualizar el usuario: ${recommendation.userId}`,
      );
    }

    this.logger.debug(
      `[Adaptador] Recomendación actualizada para usuario: ${recommendation.userId}`,
    );
    return this.mapDocumentToEntity(updated);
  }

  async delete(userId: string): Promise<void> {
    this.logger.debug(
      `[Adaptador] Eliminando recomendación para usuario: ${userId}`,
    );

    const result = await this.model.findOneAndDelete({ userId }).exec();

    if (!result) {
      this.logger.warn(
        `[Adaptador] No se pudo eliminar recomendación para usuario: ${userId}`,
      );
      throw new NotFoundException(
        `No se encontraron recomendaciones para eliminar del usuario: ${userId}`,
      );
    }

    this.logger.debug(
      `[Adaptador] Recomendación eliminada para usuario: ${userId}`,
    );
  }

  async exists(userId: string): Promise<boolean> {
    const count = await this.model.countDocuments({ userId }).exec();
    return count > 0;
  }

  private mapDocumentToEntity(
    doc: RecommendationDocument,
  ): RecommendationEntity {
    return new RecommendationEntity(
      doc.userId,
      doc.recommendations,
      doc.createdAt,
      doc.updatedAt,
      doc._id?.toString(),
    );
  }
}
