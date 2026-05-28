import { Document } from 'mongoose';

export interface ProductDocument extends Document {
  _id: string;
  name: string;
  price: number;
  description?: string;
  images?: string[];
}
