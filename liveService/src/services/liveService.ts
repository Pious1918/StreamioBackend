import { liveRepository } from "../repositories/liveRepo"



export class LiveService {


    private _liveRepostiory!:liveRepository;

    constructor(){

        this._liveRepostiory = new liveRepository()
    }




    async SaveLiveData(livedata:any){

        console.log("live data @service ",livedata)

        const livedd = await this._liveRepostiory.createLivedata(livedata)
        console.log("succes")
        return livedd
    }


    async deleteLive(roomId:string){
        console.log("roomid@ servcie",roomId)

        const roomdata = await this._liveRepostiory.deletelive(roomId)
    }


    async getAlllives(){
        const alllives = await this._liveRepostiory.getall()
        return alllives
    }
}