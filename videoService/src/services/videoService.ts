import { PaidStatus } from "../enums/paidStatus.enum";
import { Visibility } from "../enums/visibility.enum";
import { IvideoDocument } from "../interfaces/IvideoDocument.interface";
import { IVideoService } from "../interfaces/IvideoService.interface";
import { VideoRepository } from "../repositories/videoRepo";



export class videoService implements IVideoService{

    private _videoRepository : VideoRepository

    constructor(){
        this._videoRepository= new VideoRepository
    }


    async getVideos(){
        return await this._videoRepository.getvideo()
    }




    async findVideo(videoId:string):Promise<IvideoDocument | undefined>{
        try {
            
            const videoData = await this._videoRepository.findbyId(videoId)
            if (!videoData) {
                throw new Error(`Video with ID ${videoId} not found`);
            }
            return videoData
        } catch (error) {
            
            console.error(error)
        }
    }

    async saveVideo(videodata :Partial<IvideoDocument> , userId:string):Promise<IvideoDocument>{

        console.log("@service")
        const completeVideoData:Partial<IvideoDocument> = {
            ...videodata,
            uploaderId:userId,
            likes:0,
            views:0,
            visibility:videodata.visibility || Visibility.PUBLIC,
            paid:videodata.paid || PaidStatus.UNPAID,
            price: videodata.price || 0 // Ensure price is added and defaults to 0 if not provided

        }


        return await this._videoRepository.uploadVideo(completeVideoData)
    }


    async getVideoUploadedbyUser(userId:string):Promise<IvideoDocument | undefined>{

        console.log('reached @serrvice')
        const videoData = await this._videoRepository.findbyId(userId)
        if (!videoData) {
            throw new Error(`Video with ID ${userId} not found`);
        }
        return videoData
    }
}