import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Nodes } from './validators/validator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('generate-data')
  generateText(@Body() body: Nodes) {
    return this.appService.generateData(body.nodes);
  }
}
