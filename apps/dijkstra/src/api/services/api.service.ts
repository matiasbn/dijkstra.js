import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../repositories/route.repository';
import { Route } from '../domain/routes.schema';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class ApiService {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly redisService: RedisService
  ) {}

  async redisClient(): Promise<any> {
    return this.redisService.getClient();
  }

  async generateData(nodes): Promise<Route[]> {
    const Nodes = new Set();
    const alphabet = new Array(nodes)
      .fill('')
      .map((element, index) => String.fromCharCode(65 + index));
    const adjacentList = alphabet.reduce((distances, letter) => {
      Nodes.add(letter);
      for (const alpha of alphabet) {
        if (alpha > letter) {
          const route: Route = {
            route: `${letter}${alpha}`,
            distance: Math.floor(Math.random() * 10),
          };
          distances.push(route);
        }
      }
      return [...distances];
    }, []);
    await this.routeRepository.deleteRoutes();
    const createdRoutes = await this.routeRepository.createRoutes(adjacentList);
    const redisClient = await this.redisClient();
    const storedNodes = JSON.stringify([...Nodes])
      .replace(/"/g, '')
      .replace('[', '')
      .replace(']', '');
    await redisClient.set('nodes', storedNodes);
    return createdRoutes.map((route) => {
      return { route: route.route, distance: route.distance };
    });
  }

  async uploadFile(file): Promise<Route[]> {
    const Nodes = new Set();
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
        Nodes.add(tokenized[0]);
        Nodes.add(tokenized[1]);
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
    const storedNodes = JSON.stringify([...Nodes])
      .replace(/"/g, '')
      .replace('[', '')
      .replace(']', '');
    const redisClient = await this.redisClient();
    await redisClient.set('nodes', storedNodes);
    return createdRoutes.map((route) => {
      return { route: route.route, distance: route.distance };
    });
  }

  async shortestPath(
    origin: string,
    destination: string
  ): Promise<{} | string> {
    try {
      const redisClient = await this.redisClient();
      const notVisitedNodes = (await redisClient.get('nodes')).split(',');
      const adjacentTable = notVisitedNodes.reduce((result, node) => {
        result[node] = {
          distance: node === origin ? 0 : Infinity,
          previous: '',
          route: '',
        };
        return result;
      }, {});
      let currentNode = origin;
      while (notVisitedNodes.length) {
        notVisitedNodes.splice(notVisitedNodes.indexOf(currentNode), 1);
        const adjacentNodes = await this.getAdjacentNodes(
          currentNode,
          notVisitedNodes
        );
        for (const adjacentNode of adjacentNodes) {
          const adjacentIsClosest =
            adjacentNode.distance + adjacentTable[currentNode].distance <
            adjacentTable[adjacentNode.name].distance;
          if (adjacentIsClosest) {
            adjacentTable[adjacentNode.name].distance =
              adjacentNode.distance + adjacentTable[currentNode].distance;
            adjacentTable[adjacentNode.name].previous = currentNode;
          }
        }
        const closestNode = adjacentNodes.sort(
          (nodeA, nodeB) => nodeA.distance - nodeB.distance
        )[0]?.name;
        currentNode = closestNode;
      }

      return adjacentTable;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getAdjacentNodes(origin, notVisitedNodes): Promise<any> {
    const notVisitedRoutes = notVisitedNodes.map((node) =>
      node < origin ? `${node}${origin}` : `${origin}${node}`
    );
    const adjacentNodes = await this.routeRepository.getAdjacentNodes(
      notVisitedRoutes
    );
    return adjacentNodes.map((node) => {
      return {
        name: node.route.replace(origin, ''),
        distance: node.distance,
      };
    });
    //TODO arrojar error si es que hay un unlinked path
    // if (!adjacentNodes)
    //   return Promise.reject(`Unlinked path ${notVisitedRoutes}`);
    // const closestNode = adjacentNodes.sort(
    //   (nodeA, nodeB) => nodeA.distance - nodeB.distance
    // )[0];
    // return {
    //   closestNode: closestNode.route.replace(origin, ''),
    //   distance: closestNode.distance,
    // };
  }
}
