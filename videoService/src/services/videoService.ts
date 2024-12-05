// import { CommentServiceClientWrapper } from "../client";
import { PaidStatus } from "../enums/paidStatus.enum";
import { Visibility } from "../enums/visibility.enum";
import { IvideoDocument } from "../interfaces/IvideoDocument.interface";
import { IVideoService } from "../interfaces/IvideoService.interface";
import likedModel from "../models/likedVModel";
import VideoModel from "../models/videoModel";
import watchlaterModel from "../models/watchlaterModel";
import { VideoRepository } from "../repositories/videoRepo";



export class videoService implements IVideoService {

  private _videoRepository: VideoRepository

  // private _commentClient: CommentServiceClientWrapper
  constructor() {
    this._videoRepository = new VideoRepository
    // this._commentClient = new CommentServiceClientWrapper()
  }


  async getVideos() {
    return await this._videoRepository.getvideo()
  }


  async incrementViews(videoId: string) {
    return await this._videoRepository.updateVideoViews(videoId)
  }

 


  async savewatchlater(watchlaterData: any) {
    console.log('watchlaterdata @services', watchlaterData);
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

      console.log("@videoService")
      const videoDatas = await this._videoRepository.findOthervideosByid(videoId)
      if (!videoDatas) {
        throw new Error(`Video with ID ${videoId} not found`);
      }
      return videoDatas
    } catch (error) {
      console.error(error)
    }
  }

  async saveVideo(videodata: Partial<IvideoDocument>, userId: string): Promise<IvideoDocument> {

    console.log("@service")
    const completeVideoData: Partial<IvideoDocument> = {
      ...videodata,
      uploaderId: userId,
      likes: 0,
      views: 0,
      visibility: videodata.visibility || Visibility.PUBLIC,
      paid: videodata.paid || PaidStatus.UNPAID,
      price: videodata.price || 0 // Ensure price is added and defaults to 0 if not provided

    }


    return await this._videoRepository.uploadVideo(completeVideoData)
  }

  async likevideo(likedata: any) {
    console.log('videodata @services', likedata)
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
      console.log('likedata @unlikeService', likedata);
      await this._videoRepository.unlikeVideo(likedata);
    } catch (error) {
      console.error("Error in unlikeVideo service:", error);
      throw new Error('Failed to unlike the video');
    }
  }



  async getVideoUploadedbyUser(uploaderId: string): Promise<IvideoDocument[]> {
    console.log('Reached @service');

    // Fetch the videos
    const videoData = await this._videoRepository.findv({ uploaderId });

    // Return an empty array if no videos are found
    if (!videoData || videoData.length === 0) {
        return []; // Return an empty array instead of throwing an error
    }

    return videoData;
}

  


  async getprivatevideos(userId: string): Promise<IvideoDocument[]> {
    console.log('reached @service');
    const videoData = await VideoModel.find({ uploaderId: userId, visibility: 'private' });

    // Return an empty array if no videos are found
    return videoData;
  }




  async getlikedvideos(userId: string) {

    console.log('reached @serrvice')
    const likedvideos = await likedModel.find({ userId })
    const videoIds = likedvideos.map((likedvideo) => likedvideo.videoId)
    const videoDetails = await VideoModel.find({ _id: { $in: videoIds } });

    // Map video details to liked videos
    const populatedVideos = likedvideos.map((likedVideo) => {
      const videoDetail = videoDetails.find((video) => video._id.toString() === likedVideo.videoId);
      return {
        ...likedVideo.toObject(),
        videoDetails: videoDetail || null, // Include video details or null if not found
      };
    });

    console.log("populated videos", populatedVideos)

    return populatedVideos;

  }


  async getwatchlaterVideos(userId: string) {

    console.log('reached @serrvice')
    const likedvideos = await watchlaterModel.find({ userId })
    const videoIds = likedvideos.map((likedvideo) => likedvideo.videoId)
    const videoDetails = await VideoModel.find({ _id: { $in: videoIds } });

    // Map video details to liked videos
    const populatedVideos = likedvideos.map((likedVideo) => {
      const videoDetail = videoDetails.find((video) => video._id.toString() === likedVideo.videoId);
      return {
        ...likedVideo.toObject(),
        videoDetails: videoDetail || null, // Include video details or null if not found
      };
    });

    console.log("populated videos", populatedVideos)

    return populatedVideos;

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
    // Use repository to update the video data
    return await this._videoRepository.updateVideo(videoId, updatedFields);
  }




  // public async addCommentToVideo(videoId: string, userId: string, content: string): Promise<void> {
  //   try {
  //     const response = await this._commentClient.postComment(videoId, userId, content);
  //     console.log('Comment added:', response);
  //   } catch (error) {
  //     console.error('Failed to add comment:', error);
  //   }
  // }

  // public async displayComments(videoId: string): Promise<void> {
  //   try {
  //     const comments = await this._commentClient.getAllComments(videoId);
  //     console.log('Comments for video:', comments);
  //   } catch (error) {
  //     console.error('Failed to fetch comments:', error);
  //   }
  // }
}