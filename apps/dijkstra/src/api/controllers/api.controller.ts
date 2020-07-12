import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiService } from '../services/api.service';
import { Nodes, File, ShortestPath } from '../validators/validator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('dijkstra')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post('generate-data')
  generateData(@Body() body: Nodes) {
    return this.apiService.generateData(body.nodes);
  }
  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: File) {
    return this.apiService.uploadFile(file);
  }

  @Get('shortest-path')
  shortestPath(@Query() params: ShortestPath) {
    return this.apiService.shortestPath(params.origin, params.destination);
  }
}
