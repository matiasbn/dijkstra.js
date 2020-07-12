import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Route } from '../domain/routes.schema';

@Injectable()
export class RouteRepository {
  constructor(
    @InjectModel(Route.name) private readonly routeModel: Model<Route>
  ) {}

  createRoutes(routes: Route[]): Promise<Route[]> {
    return this.routeModel.insertMany(routes);
  }

  deleteRoutes(): Promise<void> {
    return this.routeModel.deleteMany({});
  }

  getAdjacentNodes(node: string): Promise<Route[]> {
    return this.routeModel.find(
      { route: new RegExp(node) },
      { route: true, distance: true, _id: false }
    );
  }
}
