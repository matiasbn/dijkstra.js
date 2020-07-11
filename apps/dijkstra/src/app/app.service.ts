import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import * as ObjectToCSV from 'objects-to-csv';
import * as path from 'path';

@Injectable()
export class AppService {
  constructor(@Inject('winston') private readonly logger: Logger) {}
  generateData(nodes): string[] {
    const alphabet = new Array(nodes)
      .fill('')
      .map((element, index) => String.fromCharCode(65 + index));
    const adjacentList = alphabet.reduce((distances, letter) => {
      for (const alpha of alphabet) {
        if (alpha > letter)
          distances.push({
            origin: letter,
            destination: alpha,
            distance: Math.floor(Math.random() * 100),
          });
      }
      return [...distances];
    }, []);
    this.logger.info(adjacentList);
    const pathToAssets = path.resolve(`${__dirname}`, '../assets/');
    console.log(pathToAssets);
    // await ObjectToCSV.save(`${__dirname}/adjancetlist.csv`);
    return adjacentList;
  }
}
