import { Document, FilterQuery, Model } from "mongoose";


export class BaseRepository<T extends Document>{

    private model:Model<T>

    constructor(model:Model<T>){

        this.model = model;
    }

    async save(item: Partial<T>): Promise<T | null> {
        const newItem = new this.model(item);
        return newItem.save();
    }
    
}