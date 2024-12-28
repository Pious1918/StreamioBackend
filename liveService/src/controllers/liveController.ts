import { StatusCodes } from "../enums/statusCode.enum";
import { IAuthRequest } from "../middlewares/authMiddleware";
import { LiveService } from "../services/liveService";
import { getPresignedUrl } from "../utils/s3";
import { NextFunction, Request, Response } from "express";



export class liveController {


    private _liveService: LiveService

    constructor() {
        this._liveService = new LiveService()
    }



    public genPresignedurl = async (req: IAuthRequest, res: Response) => {
        const { fileName, fileType } = req.body
        try {

            const presignedUrl = await getPresignedUrl(fileName, fileType);
            res.json({ presignedUrl });

        } catch (err) {

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "hai" });
        }
    }



    public saveLiveData = async (req: IAuthRequest, res: Response) => {
        const { roomId, title, description, imageurl, streamerId } = req.body

        try {

            const livedata = {
                roomId: roomId,
                title: title,
                description: description,
                imageurl: imageurl,
                streamerId: streamerId
            }

            const livese = await this._liveService.SaveLiveData(livedata)
            res.status(StatusCodes.OK).json({ livese, message: 'saved live data' })

        } catch (error) {
            console.error("ererore is ", error)
        }
    }



    public deleteLivedata = async (req: IAuthRequest, res: Response) => {
        try {
            const { roomid } = req.params
            const live = await this._liveService.deleteLive(roomid)
            res.status(StatusCodes.OK).json({ message: 'deleted succesfully' })
        } catch (error) {
            console.error("ererore is ", error)
        }
    }



    public getOngoinglives = async (req: IAuthRequest, res: Response) => {

        try {
            const allLives = await this._liveService.getAlllives()
            res.status(StatusCodes.OK).json({ allLives })

        } catch (error) {

            console.error("ererore is ", error)

        }
    }

}