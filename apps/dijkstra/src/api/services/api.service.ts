import { Injectable, Logger } from '@nestjs/common';
import { RouteRepository } from '../repositories/route.repository';
import { Route } from '../domain/routes.schema';

@Injectable()
export class ApiService {
  constructor(
    private readonly logger: Logger,
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
            route: `${letter}${alpha}`,
            distance: Math.floor(Math.random() * 100),
          };
          distances.push(route);
        }
      }
      return [...distances];
    }, []);
    await this.routeRepository.deleteRoutes();
    return await this.routeRepository.createRoutes(adjacentList);
  }

  async uploadFile(file): Promise<Route[]> {
    const distances = file.buffer
      .toString()
      .toUpperCase()
      .split('\n')
      .filter((line) => line !== '')
      // transforms B,A,2 to A,B,2
      .map((line) => {
        const tokenized = line.split(',');
        const ordered = tokenized[0] < tokenized[1] ? [0, 1] : [1, 0];
        return `${tokenized[ordered[0]]},${tokenized[ordered[1]]},${
          tokenized[2]
        }`;
      })
      .sort((a, b) => {
        const tokenA = a.split(',');
        const tokenB = b.split(',');
        // if first is the same letter, compare the second letter
        const index = tokenA[0] === tokenB[0] ? 1 : 0;
        return tokenA[index] > tokenB[index] ? 1 : -1;
      })
      .filter((line) => line.split(',')[0] !== line.split(',')[1])
      // deletes repeated routes
      .reduce((result, line) => {
        const tokenized = line.split(',');
        result[`${tokenized[0]}${tokenized[1]}`] = tokenized[2];
        return result;
      }, {});

    const routes: Route[] = Object.keys(distances).map((distance) => {
      return {
        route: distance,
        distance: distances[distance],
      };
    });
    await this.routeRepository.deleteRoutes();
    const createdRoutes = await this.routeRepository.createRoutes(routes);
    return createdRoutes;
  }
}
