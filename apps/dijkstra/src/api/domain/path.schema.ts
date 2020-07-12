import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Path extends Document {
  @Prop({ required: true })
  origin: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  route: string;

  @Prop({ required: true })
  distance: number;
}

export const PathSchema = SchemaFactory.createForClass(Path);
