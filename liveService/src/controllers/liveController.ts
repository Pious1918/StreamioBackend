import { IAuthRequest } from "../middlewares/authMiddleware";
import { LiveService } from "../services/liveService";
import { getPresignedUrl } from "../utils/s3";
import { NextFunction, Request, Response } from "express";



export class liveController{


    private _liveService : LiveService

    constructor(){

        this._liveService = new LiveService()
    }



    public genPresignedurl = async (req: IAuthRequest, res: Response) => {
        const { fileName, fileType } = req.body
        try {

            console.log("fileName, fileType",fileName, fileType)

            const presignedUrl = await getPresignedUrl(fileName, fileType);
            res.json({ presignedUrl });
        } catch (err) {
            res.status(500).json({ error: "hai" });
        }
    }



    public saveLiveData =async(req:IAuthRequest,res:Response)=>{
        const {roomId , title , description , imageurl , streamerId}=req.body
        
        console.log("roomId , title , description , imageurl , streamerId",roomId , title , description , imageurl , streamerId)
        try {
            

            const livedata = {
                roomId :roomId,
                title:title,
                description:description,
                imageurl:imageurl,
                streamerId:streamerId
            }

            const livese = await this._liveService.SaveLiveData(livedata)

            res.status(200).json({livese , message:'saved live data'})

        } catch (error) {
            console.error("ererore is ",error)
        }
    }



    public deleteLivedata = async(req:IAuthRequest , res:Response)=>{
        try {
            const {roomid} = req.params
            console.log("room id is ",roomid)
            const live = await this._liveService.deleteLive(roomid)
            res.status(200).json({message :'deleted succesfully'})
        } catch (error) {
            
        }
    }



    public getOngoinglives = async(req:IAuthRequest , res:Response)=>{


        try {
            const allLives = await this._liveService.getAlllives()
            res.status(200).json({allLives})
        } catch (error) {
            
        }
    }
    
}