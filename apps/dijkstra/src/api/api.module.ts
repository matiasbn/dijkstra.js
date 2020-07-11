import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiController } from './controllers/api.controller';
import { ApiService } from './services/api.service';
import { Route, RouteSchema } from './domain/routes.schema';
import { RouteRepository } from './repositories/route.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Route.name, schema: RouteSchema }]),
  ],
  controllers: [ApiController],
  providers: [ApiService, RouteRepository],
})
export class ApiModule {}
