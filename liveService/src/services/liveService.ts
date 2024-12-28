import { liveRepository } from "../repositories/liveRepo"



export class LiveService {


    private _liveRepostiory!:liveRepository;

    constructor(){

        this._liveRepostiory = new liveRepository()
    }


    async SaveLiveData(livedata:any){

        const livedd = await this._liveRepostiory.createLivedata(livedata)
        return livedd

    }


    async deleteLive(roomId:string){
        const roomdata = await this._liveRepostiory.deletelive(roomId)
    }


    async getAlllives(){
        const alllives = await this._liveRepostiory.getall()
        return alllives
    }
}