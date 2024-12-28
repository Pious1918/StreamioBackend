import { NextFunction, Request, Response } from "express";
import { generatePresignedURL } from "../utils/up";
import { AdminService } from "../services/adminService";
import { StatusCodes } from "../enums/statusCode.enums";





export class AdminController {

    private _adminService: AdminService
    
    constructor() {
        this._adminService = new AdminService()
    }


    public gencommonPresignedurl = async (req: Request, res: Response) => {
        const { bucketname, fileName, fileType } = req.body

        try {

            const presignedUrl = await generatePresignedURL(bucketname, fileName, fileType);
            res.json({ presignedUrl });

        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "hai" });
        }
    }


    public saveBanner = async (req: Request, res: Response) => {
        const { title, description, image } = req.body;

        try {

            const result = await this._adminService.saveBannerData(title, description, image);
            res.status(StatusCodes.OK).json({ result, message: 'It is a success' });

        } catch (error) {

            console.error("Error saving banner details:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error saving banner details', error });

        }
    }



    public getBanner = async (req: Request, res: Response) => {

        try {

            const getbanner = await this._adminService.getBanner()
            res.status(StatusCodes.OK).json({ getbanner, message: 'banner fetching is successfull' })

        } catch (error) {
            console.error("error getting banner")
        }
    }


    public deletebanner = async (req: Request, res: Response) => {
        try {

            const { id } = req.body
            const bannerdetails = await this._adminService.deleteBusingid(id)
            res.status(StatusCodes.OK).json({ message: 'banner deleted succefully' })

        } catch (error) {

            console.error("error deleting banner")

        }
    }

}