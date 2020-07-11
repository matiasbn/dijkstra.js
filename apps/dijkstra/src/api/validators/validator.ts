import {
  IsAlpha,
  IsNotEmpty,
  IsNotEmptyObject,
  Max,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class Nodes {
  @Transform((nodes) => parseInt(nodes))
  @Max(26)
  @IsNotEmpty()
  readonly nodes: number;
}

export class File {
  @IsNotEmptyObject()
  readonly file: object;
}

export class ShortestPath {
  @Transform((origin) => origin.toUpperCase())
  @IsAlpha()
  @MaxLength(1)
  @IsNotEmpty()
  readonly origin: string;

  @Transform((destination) => destination.toUpperCase())
  @IsAlpha()
  @MaxLength(1)
  @IsNotEmpty()
  readonly destination: string;
}
