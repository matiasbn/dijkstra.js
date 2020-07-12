import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiService } from '../services/api.service';
import { Nodes, ShortestPath, AllPaths } from '../validators/validator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('dijkstra')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  checkFile(file): boolean {
    const format = file.originalname.split('.')[1];
    if (!format.match(/(csv|txt)/)) return false;
    if (!file.buffer) return false;
    const lines = file.buffer
      .toString()
      .split('\n')
      .filter((line) => line !== '');
    for (const line of lines) {
      const tokenized = line.split(',');
      if (tokenized.length < 3) return false;
      if (tokenized.some((token) => token === '')) return false;
      if (tokenized.some((token, index) => index < 2 && token.length > 1))
        return false;
      if (typeof tokenized[0] !== 'string') return false;
      if (typeof tokenized[1] !== 'string') return false;
      if (isNaN(tokenized[2])) return false;
    }
    return true;
  }

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file) {
    if (!this.checkFile(file))
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: `File format not recognized`,
        },
        HttpStatus.FORBIDDEN
      );
    const buffer = file.buffer;
    return this.apiService.uploadFile(buffer);
  }

  @Post('generate-data')
  generateData(@Body() body: Nodes) {
    return this.apiService.generateData(body.nodes);
  }

  @Get('shortest-path')
  shortestPath(@Query() params: ShortestPath) {
    return this.apiService.dijkstra(params.origin, params.destination);
  }

  @Get('all-paths')
  allPaths(@Query() params: AllPaths) {
    return this.apiService.dijkstra(params.origin);
  }
}
