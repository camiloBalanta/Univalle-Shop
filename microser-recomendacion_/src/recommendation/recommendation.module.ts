import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Domain Use Cases
import { GetRecommendationsUseCase } from './domain/use-cases/get-recommendations.use-case';
import { UpdateRecommendationsUseCase } from './domain/use-cases/update-recommendations.use-case';
import { DeleteRecommendationsUseCase } from './domain/use-cases/delete-recommendations.use-case';

// Application Services
import { RecommendationApplicationService } from './application/services/recommendation-application.service';

// Infrastructure Adapters
import { RecommendationController } from './infrastructure/controllers/recommendation.controller';
import { MongooseRecommendationRepository } from './infrastructure/adapters/persistence/mongoose-recommendation.repository';
import { ExternalServiceAdapter } from './infrastructure/adapters/external-service.adapter';
import {
  Recommendation,
  RecommendationSchema,
} from './infrastructure/adapters/persistence/recommendation.schema';

// Injection Tokens
import {
  RECOMMENDATION_REPOSITORY_TOKEN,
  EXTERNAL_SERVICE_PORT_TOKEN,
} from './domain/ports/injection-tokens';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recommendation.name, schema: RecommendationSchema },
    ]),
  ],
  controllers: [RecommendationController],
  providers: [
    // Domain Use Cases
    GetRecommendationsUseCase,
    UpdateRecommendationsUseCase,
    DeleteRecommendationsUseCase,

    // Application Services
    RecommendationApplicationService,

    // Infrastructure Adapters
    {
      provide: RECOMMENDATION_REPOSITORY_TOKEN,
      useClass: MongooseRecommendationRepository,
    },
    {
      provide: EXTERNAL_SERVICE_PORT_TOKEN,
      useClass: ExternalServiceAdapter,
    },
  ],
})
export class RecommendationModule {}
