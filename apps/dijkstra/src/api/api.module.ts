import {
  Logger,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiController } from './controllers/api.controller';
import { ApiService } from './services/api.service';
import { Route, RouteSchema } from './domain/routes.schema';
import { RouteRepository } from './repositories/route.repository';
import * as helmet from 'helmet';
import { PathRepository } from './repositories/path.repository';
import { Path, PathSchema } from './domain/path.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Route.name, schema: RouteSchema },
      { name: Path.name, schema: PathSchema },
    ]),
  ],
  controllers: [ApiController],
  providers: [Logger, ApiService, PathRepository, RouteRepository],
})
export class ApiModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(helmet())
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(
        helmet.hsts({
          maxAge: 8000000,
        })
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
