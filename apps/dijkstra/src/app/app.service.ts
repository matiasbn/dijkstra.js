import { Injectable } from '@nestjs/common';
import {Logger} from 'winston'

@Injectable()
export class AppService {

  // constructor(private readonly logger: Logger) {  }
  generateData(request): { message: string } {
    console.log(request);
    return { message: 'Welcome to dijkstra!' };
  }
}
