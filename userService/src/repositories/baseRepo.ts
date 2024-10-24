
import { Document, FilterQuery, Model } from "mongoose";

export interface IBaseRepository<T>{
    save(item:Partial<T>):Promise<T | null>;
    findOne(filter: Partial<T>): Promise<T | null>;
    findByIdAndUpdate(id:string , update:Partial<T>) : Promise<T | null>;
    find(filter? : Partial<T>): Promise<T[]>;
    findAndUpdateSet(id: string, field: keyof T, value: any): Promise<T | null>;

}

export class BaseRepository<T extends Document> implements IBaseRepository<T> {

    private model: Model<T>;

    constructor(model: Model<T>) {
        console.log("Parent is called")
        this.model = model;

    }

    async save(item: Partial<T>): Promise<T | null> {
        const newItem = new this.model(item);
        return newItem.save();
    }

    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(filter);
    }

    async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, update, { new: true });
    }


    async findAndUpdateSet(id: string, field: keyof T, value: any): Promise<T | null> {
        const result = await this.model.findByIdAndUpdate(
            id,
            { $addToSet: { [field as string]: value } } as any,  // Bypass type check for the dynamic field
            { new: true }  // Return the updated document
        ).exec();
    
        // Return the document or null
        return result ? result as T : null;
    }
    async uNfindAndUpdateSet(id: string, field: keyof T, value: any): Promise<T | null> {
        const result = await this.model.findByIdAndUpdate(
            id,
            { $pull: { [field as string]: value } } as any,  // Bypass type check for the dynamic field
            { new: true }  // Return the updated document
        ).exec();
    
        // Return the document or null
        return result ? result as T : null;
    }
    

    
    async find(filter?: Partial<T> | undefined): Promise<T[]> {
        return this.model.find()
    }

    
    
    
    
    

}
