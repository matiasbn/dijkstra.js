import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { ApiService } from '../services/api.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [ApiService],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Welcome to dijkstra!"', () => {
      const appController = app.get<ApiController>(ApiController);
      expect(appController.generateData({ nodes: 5 })).toEqual({
        message: 'Welcome to dijkstra!',
      });
    });
  });
});
