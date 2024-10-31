import { Document } from 'mongoose';

export interface IBaseRepository<T extends Document> {
  find(): Promise<T[]>;
  save(item: Partial<T>): Promise<T | null>;
  findbyIdd(id: string): Promise<T | null>;
}
