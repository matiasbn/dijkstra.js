import { Controller, Get, Req, Request, Res, Response } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('generate-data')
  generateText(@Req() request: Request) {
    return this.appService.generateData(request);
  }
}
