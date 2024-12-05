import liveModel, { IliveDocument } from "../model/liveModel";
import { BaseRepository } from "./baseRepo";



export class liveRepository extends BaseRepository<IliveDocument>{

    constructor(){
        super(liveModel)
    }


    async createLivedata(liveData:Partial<IliveDocument>):Promise<IliveDocument | null>{
        return this.save(liveData)
    }


    async deletelive(romIdz:any){
        return liveModel.findOneAndDelete(romIdz)
    }

    async getall(){
        return liveModel.find()
    }
}