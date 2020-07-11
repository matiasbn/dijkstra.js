import {
  Logger,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as helmet from 'helmet';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston/dist/winston.utilities';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiModule } from './api/api.module';
import { MorganModule, MorganInterceptor } from 'nest-morgan';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';

class ExtendedLogger extends Logger {
  write(message: string, trace: string) {
    super.log(message, trace);
  }
}

@Module({
  imports: [
    ApiModule,
    MorganModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              nestWinstonModuleUtilities.format.nestLike()
            ),
          }),
        ],
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MorganInterceptor('common', { stream: new ExtendedLogger() }),
    },
  ],
})
export class AppModule {
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
