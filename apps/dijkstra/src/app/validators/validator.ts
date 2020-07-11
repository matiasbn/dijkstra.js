import { IsNotEmpty, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class Nodes {
  @Transform((nodes) => parseInt(nodes))
  @Max(26)
  @IsNotEmpty()
  readonly nodes: number;
}