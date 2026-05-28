import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Recommendations (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /recommendations/:userId', () => {
    it('should return recommendations for a valid userId', () => {
      return request(app.getHttpServer())
        .get('/recommendations/user123')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('userId', 'user123');
          expect(res.body).toHaveProperty('recommendations');
          expect(Array.isArray(res.body.recommendations)).toBe(true);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 400 for userId too long', () => {
      const longUserId = 'x'.repeat(101);
      return request(app.getHttpServer())
        .get(`/recommendations/${longUserId}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.statusCode).toBe(400);
        });
    });
  });

  describe('PUT /recommendations/:userId', () => {
    it('should update recommendations for a valid userId', () => {
      return request(app.getHttpServer())
        .put('/recommendations/user456')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('userId', 'user456');
          expect(res.body).toHaveProperty('recommendations');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 400 for invalid userId', () => {
      return request(app.getHttpServer())
        .put('/recommendations/123@invalid')
        .expect((res) => {
          expect(res.status).toBe(400);
        });
    });
  });

  describe('DELETE /recommendations/:userId', () => {
    it('should return 204 when deleting recommendations', () => {
      // Primero crear recomendaciones
      return request(app.getHttpServer())
        .put('/recommendations/userToDelete')
        .then(() => {
          // Luego deletearlas
          return request(app.getHttpServer())
            .delete('/recommendations/userToDelete')
            .expect(204);
        });
    });
  });

});
