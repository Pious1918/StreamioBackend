import { Document, Model } from "mongoose";


export class BaseRepository<T extends Document>{


    private _model:Model<T>

    constructor(model:Model<T>){
        this._model= model
    }

    async save(item:Partial<T>):Promise<T | null>{
        const newItem = new this._model(item)
        return newItem.save()
    }
}