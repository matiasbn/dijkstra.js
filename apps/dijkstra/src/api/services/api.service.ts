import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import * as ObjectToCSV from 'objects-to-csv';
import * as path from 'path';
import { RouteRepository } from '../repositories/route.repository';
import { Route } from '../domain/routes.schema';

@Injectable()
export class ApiService {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly routeRepository: RouteRepository
  ) {}
  async generateData(nodes): Promise<Route[]> {
    const alphabet = new Array(nodes)
      .fill('')
      .map((element, index) => String.fromCharCode(65 + index));
    const adjacentList = alphabet.reduce((distances, letter) => {
      for (const alpha of alphabet) {
        if (alpha > letter) {
          const route: Route = {
            origin: letter,
            destination: alpha,
            distance: Math.floor(Math.random() * 100),
          };
          distances.push(route);
        }
      }
      return [...distances];
    }, []);
    await this.routeRepository.deleteRoutes();
    const storedRoutes = await this.routeRepository.createRoutes(adjacentList);
    return storedRoutes;
    // const pathToAssets = path.resolve(`${__dirname}`, '../assets/');
    // console.log(pathToAssets);
    // await ObjectToCSV.save(`${__dirname}/adjancetlist.csv`);
  }
}
