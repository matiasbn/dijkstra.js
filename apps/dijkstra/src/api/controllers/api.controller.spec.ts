import { Test, TestingModule } from '@nestjs/testing';

import { ApiController } from './api.controller';
import { AppService } from './api.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [AppService],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Welcome to dijkstra!"', () => {
      const appController = app.get<ApiController>(ApiController);
      expect(appController.getData()).toEqual({
        message: 'Welcome to dijkstra!',
      });
    });
  });
});
