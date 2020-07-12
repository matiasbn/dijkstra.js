import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../repositories/route.repository';
import { Route } from '../domain/routes.schema';
import { RedisService } from 'nestjs-redis';
import { Path } from '../domain/path.schema';
import { PathRepository } from '../repositories/path.repository';

@Injectable()
export class ApiService {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly pathRepository: PathRepository,
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
    await this.pathRepository.deletePaths();
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
    await this.pathRepository.deletePaths();
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

  async dijkstra(
    origin: string,
    destination: string = null
  ): Promise<Path[] | Path> {
    const storedPaths = destination
      ? await this.pathRepository.findSinglePath(origin, destination)
      : await this.pathRepository.findPaths(origin);
    if (storedPaths.length) return destination ? storedPaths[0] : storedPaths;
    const redisClient = await this.redisClient();
    const notVisitedNodes = (await redisClient.get('nodes')).split(',');
    const adjacencyTable = notVisitedNodes.reduce((result, node) => {
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
          adjacentNode.distance + adjacencyTable[currentNode].distance <
          adjacencyTable[adjacentNode.name].distance;
        if (adjacentIsClosest) {
          adjacencyTable[adjacentNode.name].distance =
            adjacentNode.distance + adjacencyTable[currentNode].distance;
          adjacencyTable[adjacentNode.name].previous = currentNode;
          adjacencyTable[adjacentNode.name].route =
            adjacencyTable[currentNode].route + adjacentNode.name;
        }
      }
      const closestNode = adjacentNodes.sort(
        (nodeA, nodeB) => nodeA.distance - nodeB.distance
      )[0]?.name;
      currentNode = closestNode;
    }
    const paths: Path[] = Object.keys(adjacencyTable).map((key) => {
      const node = adjacencyTable[key];
      return {
        origin: origin,
        destination: key,
        route: origin + node.route,
        distance: node.distance,
      };
    });
    await this.pathRepository.createPaths(paths);
    return destination
      ? paths.find((node) => node.destination === destination)
      : paths;
  }

  async getAdjacentNodes(
    origin: string,
    notVisitedNodes: string[]
  ): Promise<{ name: string; distance: number }[]> {
    const notVisitedRoutes = notVisitedNodes.map((node) =>
      node < origin ? `${node}${origin}` : `${origin}${node}`
    );
    const adjacentNodes = await this.routeRepository.getAdjacentNodes(
      notVisitedRoutes
    );
    //TODO arrojar error si es que hay un unlinked path
    // if (!adjacentNodes)
    //   return Promise.reject(`Unlinked path ${notVisitedRoutes}`);
    return adjacentNodes.map((node) => {
      return {
        name: node.route.replace(origin, ''),
        distance: node.distance,
      };
    });
  }
}
