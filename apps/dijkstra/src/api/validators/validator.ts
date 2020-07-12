import { IsAlpha, IsDefined, IsNotEmpty, Length, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class Nodes {
  @Transform((nodes) => parseInt(nodes))
  @Max(26)
  @IsNotEmpty()
  readonly nodes: number;
}

export class ShortestPath {
  @Transform((origin) => origin.toUpperCase())
  @IsAlpha()
  @Length(1, 1)
  @IsNotEmpty()
  readonly origin: string;

  @Transform((destination) => destination.toUpperCase())
  @IsAlpha()
  @Length(1, 1)
  @IsNotEmpty()
  readonly destination: string;
}

export class AllPaths {
  @Transform((origin) => origin.toUpperCase())
  @IsAlpha()
  @Length(1, 1)
  @IsNotEmpty()
  readonly origin: string;
}
