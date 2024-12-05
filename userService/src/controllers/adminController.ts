import { NextFunction, Request, Response } from "express";
import { generatePresignedURL } from "../utils/up";
import { AdminService } from "../services/adminService";





export class AdminController {

    private _adminService: AdminService


    constructor() {
        this._adminService = new AdminService()
    }


    public gencommonPresignedurl = async (req: Request, res: Response) => {
        const { bucketname, fileName, fileType } = req.body
        try {
            console.log("bodyy", bucketname, fileName, fileType)
            const presignedUrl = await generatePresignedURL(bucketname, fileName, fileType);
            res.json({ presignedUrl });
        } catch (err) {
            res.status(500).json({ error: "hai" });
        }
    }


    public saveBanner = async (req: Request, res: Response) => {
        const { title, description, image } = req.body;
        console.log("Received Data:", title, description, image);

        try {
            // Correct use of await
            const result = await this._adminService.saveBannerData(title, description, image);
            res.status(200).json({ result, message: 'It is a success' });
        } catch (error) {
            // Detailed logging for debugging
            console.error("Error saving banner details:", error);
            res.status(500).json({ message: 'Error saving banner details', error });
        }
    }



    public getBanner = async(req:Request , res:Response)=>{

        try {
            
            const getbanner = await this._adminService.getBanner()

            res.status(200).json({getbanner, message:'banner fetching is successfull'})

        } catch (error) {
            console.error("error getting banner")
        }
    }


    public deletebanner = async(req:Request, res : Response)=>{
        try {

            const {id} =req.body
            console.log("idd is ",id)
            const bannerdetails = await this._adminService.deleteBusingid(id)
            res.status(200).json({message :'banner deleted succefully'})
        } catch (error) {
            
        }
    }

}