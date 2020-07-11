import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiService } from '../services/api.service';
import { Nodes, File } from '../validators/validator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('dijkstra')
export class ApiController {
  constructor(private readonly appService: ApiService) {}

  @Post('generate-data')
  generateText(@Body() body: Nodes) {
    return this.appService.generateData(body.nodes);
  }
  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: File) {
    return this.appService.uploadFile(file);
  }
}
