// import { CommentServiceClientWrapper } from "../client";
import { PaidStatus } from "../enums/paidStatus.enum";
import { Visibility } from "../enums/visibility.enum";
import { IvideoDocument } from "../interfaces/IvideoDocument.interface";
import { IVideoService } from "../interfaces/IvideoService.interface";
import likedModel from "../models/likedVModel";
import reportModel from "../models/reportModel";
import VideoModel from "../models/videoModel";
import watchlaterModel from "../models/watchlaterModel";
import { VideoRepository } from "../repositories/videoRepo";



export class videoService implements IVideoService {

  private _videoRepository: VideoRepository

  constructor() {
    this._videoRepository = new VideoRepository
  }


  async getVideos() {
    return await this._videoRepository.getvideo()
  }

  async getVideosByCategory(category: string) {
    return await this._videoRepository.getCategoryvideo(category)
  }


  async incrementViews(videoId: string) {
    return await this._videoRepository.updateVideoViews(videoId)
  }


  async savewatchlater(watchlaterData: any) {

    try {
      const watchlaterdatas = {
        videoId: watchlaterData.videoid,
        userId: watchlaterData.userid,
      };

      return await this._videoRepository.watchlaterVideo(watchlaterdatas);
    } catch (error) {
      console.error(error);
      throw new Error('Error in saving Watch Later video');
    }
  }


  async findVideo(videoId: string): Promise<IvideoDocument | undefined> {

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


  async topViewed() {

    try {

      const videodata = await this._videoRepository.topviewdata()
      return videodata

    } catch (error) {

      console.error(error)

    }
  }


  async findOtherVideos(videoId: string) {
    try {

      const videoDatas = await this._videoRepository.findOthervideosByid(videoId)

      if (!videoDatas) {
        throw new Error(`Video with ID ${videoId} not found`);
      }

      return videoDatas
    } catch (error) {
      console.error(error)
    }

  }


  async getAllreports(videoId: string) {

    try {

      const reportDatas = await this._videoRepository.findreportdatas(videoId)
      return reportDatas

    } catch (error) {
      console.error(error)
    }
  }


  async saveVideo(videodata: Partial<IvideoDocument>, userId: string): Promise<IvideoDocument> {

    const completeVideoData: Partial<IvideoDocument> = {
      ...videodata,
      uploaderId: userId,
      likes: 0,
      views: 0,
      visibility: videodata.visibility || Visibility.PUBLIC,
      paid: videodata.paid || PaidStatus.UNPAID,
      price: videodata.price || 0

    }

    return await this._videoRepository.uploadVideo(completeVideoData)

  }


  async saveReportdata(reportVdata: any, reporterId: string) {

    try {

      const reportdata = {
        reporterId: reporterId,
        uploaderId: reportVdata.uploaderId,
        videoId: reportVdata.videoId,
        reason: reportVdata.reason,
      }

      return await this._videoRepository.saveReportdata(reportdata)

    } catch (error) {
      console.error(error)
    }
  }


  async verifyVedio(videoId: string) {
    try {

      const result = await this._videoRepository.saveVerifieddata(videoId);
      return { success: true, data: result };

    } catch (error) {
      console.error(error);
      return { success: false, message: 'An error occurred during video verification' };
    }
  }


  async sendnotice(noticedata: any) {
    try {

      const result = await this._videoRepository.saveNoticedata(noticedata);

      if (result.alreadyExists) {
        return { success: false, message: 'Notice already sent for this video.' };
      } else {
        return { success: true, message: 'Notice sent successfully.' };
      }

    } catch (error) {
      console.error(error);
      return { success: false, message: 'An error occurred while sending the notice.' };
    }
  }


  async likevideo(likedata: any) {

    try {
      const likedatas = {
        videoId: likedata.videoid,
        userId: likedata.userid,
      }

      return await this._videoRepository.likeVideo(likedatas)
    } catch (error) {
      console.error(error)
    }
  }


  async unlikeVideo(likedata: any) {

    try {
      await this._videoRepository.unlikeVideo(likedata);
    } catch (error) {
      console.error("Error in unlikeVideo service:", error);
      throw new Error('Failed to unlike the video');
    }
  }


  async getVideoUploadedbyUser(uploaderId: string): Promise<IvideoDocument[]> {

    const videoData = await this._videoRepository.findv({ uploaderId });

    if (!videoData || videoData.length === 0) {
      return [];
    }

    return videoData;
  }


  async getprivatevideos(userId: string): Promise<IvideoDocument[]> {

    const videoData = await VideoModel.find({ uploaderId: userId, visibility: 'private' });
    return videoData;

  }


  async getlikedvideos(userId: string) {

    const likedvideos = await likedModel.find({ userId })
    const videoIds = likedvideos.map((likedvideo) => likedvideo.videoId)
    const videoDetails = await VideoModel.find({ _id: { $in: videoIds } });
    const populatedVideos = likedvideos.map((likedVideo) => {
      const videoDetail = videoDetails.find((video) => video._id.toString() === likedVideo.videoId);
      return {
        ...likedVideo.toObject(),
        videoDetails: videoDetail || null,
      };
    });

    return populatedVideos;

  }


  async getwatchlaterVideos(userId: string) {

    const likedvideos = await watchlaterModel.find({ userId })
    const videoIds = likedvideos.map((likedvideo) => likedvideo.videoId)
    const videoDetails = await VideoModel.find({ _id: { $in: videoIds } });
    const populatedVideos = likedvideos.map((likedVideo) => {
      const videoDetail = videoDetails.find((video) => video._id.toString() === likedVideo.videoId);
      return {
        ...likedVideo.toObject(),
        videoDetails: videoDetail || null,
      };
    });

    return populatedVideos;

  }

  async getreportVideos(userId: string) {

    const reportedVideos = await this._videoRepository.getReportedVideosByUserId(userId);
    return reportedVideos;

  }



  async getreportVideoAdmin() {

    try {
      return await this._videoRepository.getReportAboveTen()
    } catch (error) {
      console.log(error)
    }

  }


  async getLikedStatus(userId: string, videoId: string): Promise<boolean> {
    try {
      return await this._videoRepository.findLikedStatus(userId, videoId);
    } catch (error) {
      console.error("Error in getLikedStatus:", error);
      throw error;
    }
  }


  async updateVideoData(videoId: string, updatedFields: any) {
    return await this._videoRepository.updateVideo(videoId, updatedFields);
  }

}