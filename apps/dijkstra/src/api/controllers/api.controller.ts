import { Body, Controller, Post } from '@nestjs/common';
import { ApiService } from '../services/api.service';
import { Nodes } from '../validators/validator';

@Controller()
export class ApiController {
  constructor(private readonly appService: ApiService) {}

  @Post('generate-data')
  generateText(@Body() body: Nodes) {
    return this.appService.generateData(body.nodes);
  }
}
