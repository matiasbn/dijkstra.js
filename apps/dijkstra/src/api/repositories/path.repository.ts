import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Path } from '../domain/path.schema';

@Injectable()
export class PathRepository {
  constructor(
    @InjectModel(Path.name) private readonly routeModel: Model<Path>
  ) {}

  findPaths(origin: string): Promise<Path[]> {
    return this.routeModel.find(
      { origin },
      {
        _id: false,
        origin: true,
        destination: true,
        route: true,
        distance: true,
      }
    );
  }

  findSinglePath(origin: string, destination: string): Promise<Path[]> {
    return this.routeModel.find(
      { origin, destination },
      {
        _id: false,
        origin: true,
        destination: true,
        route: true,
        distance: true,
      }
    );
  }

  createPaths(paths: Path[]): Promise<Path[]> {
    return this.routeModel.insertMany(paths);
  }

  deletePaths(): Promise<void> {
    return this.routeModel.deleteMany({});
  }
}
