
import { Document, Model } from "mongoose";
import VideoModel from "../models/videoModel";


export class BaseRepository<T extends Document>{

    private _model:Model<T>


    constructor(model:Model<T>){

        this._model=model
    }


    async find(){
        const videos = await VideoModel.find()
        return videos
    }


    async save(item:Partial<T>):Promise<T | null>{
        const newItem= new this._model(item)
        return newItem.save()
    }


    async findbyIdd(id:string):Promise<T | null>{
        const data = await this._model.findById(id)
        return data
    }
}