import { Test } from '@nestjs/testing';
import { ApiService } from './api.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Route, RouteSchema } from '../domain/routes.schema';
import { ApiController } from '../controllers/api.controller';
import { Logger } from '@nestjs/common';
import { RouteRepository } from '../repositories/route.repository';

describe('AppService', () => {
  let service: ApiService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([{ name: Route.name, schema: RouteSchema }]),
      ],
      controllers: [ApiController],
      providers: [Logger, ApiService, RouteRepository],
    }).compile();

    service = app.get<ApiService>(ApiService);
  });

  describe('generate-data', () => {
    it('should return "Welcome to dijkstra!"', async () => {
      const nodes = 5;
      const generatedData = await service.generateData(nodes);
      console.log(generatedData);
      expect(service.generateData(5)).toEqual({
        message: 'Welcome to dijkstra!',
      });
    });
  });
});
