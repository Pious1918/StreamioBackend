
import { Visibility } from "../enums/visibility.enum";
import { IvideoDocument } from "../interfaces/IvideoDocument.interface";
import { IVideoRepository } from "../interfaces/Ivideorepo.interface";
import likedModel from "../models/likedVModel";
import VideoModel from "../models/videoModel";
import watchlaterModel from "../models/watchlaterModel";
import { BaseRepository } from "./baseRepo";


export class VideoRepository extends BaseRepository<IvideoDocument> implements IVideoRepository {
  constructor() {
    super(VideoModel);
  }



  async getvideo(): Promise<IvideoDocument[]> {


    const videos = await this.find()
    if (!videos) {
      throw new Error("failed to retrive video")
    }
    // Filter videos to only include those with public visibility
    const publicVideos = videos.filter(video => video.visibility === Visibility.PUBLIC);

    return publicVideos;
  }



  async findbyId(videoId: string): Promise<IvideoDocument> {
    const videodata = await this.findbyIdd(videoId)
    if (!videodata) {
      throw new Error(`Video with ID ${videoId} not found`);

    }
    return videodata
  }


  async findLikedStatus(userId: string, videoId: string): Promise<boolean> {
    try {
      const likedStatus = await likedModel.findOne({ userId, videoId });
      return !!likedStatus; // Returns true if the video is liked, otherwise false
    } catch (error) {
      console.error("Error in findLikedStatus:", error);
      throw error;
    }
  }


  async uploadVideo(videoData: Partial<IvideoDocument>): Promise<IvideoDocument> {
    console.log('reached@vrepo')
    const savedVideo = await this.save(videoData);


    if (!savedVideo) {
      throw new Error("Failed to save video");
    }

    return savedVideo;
  }


  async likeVideo(likedata: any) {
    try {
      console.log('reached@vrepo');
  
      // Create a new instance of the model with the provided data
      const saveLikeVideo = new likedModel(likedata);
  
      // Save the data to the database
      const result = await saveLikeVideo.save();
  
      // Return the saved document
      return result;
    } catch (error) {
      console.error('Error saving video:', error);
      throw new Error('Failed to save video');
    }
  }


  async watchlaterVideo(watchlaterdata: any) {
    try {
        console.log('reached @vrepo');

        // Check if the video is already in the Watch Later list for this user
        const existingVideo = await watchlaterModel.findOne({
            videoId: watchlaterdata.videoId,
            userId: watchlaterdata.userId,
        });

        if (existingVideo) {
            console.log('Video already exists in Watch Later');
            return { isAlreadySaved: true };
        }

        // Create a new instance of the model with the provided data
        const savewatchlaterVideo = new watchlaterModel(watchlaterdata);

        // Save the data to the database
        const result = await savewatchlaterVideo.save();

        // Return the saved document
        return { isAlreadySaved: false, data: result };
    } catch (error) {
        console.error('Error saving video:', error);
        throw new Error('Failed to save video');
    }
}



  async unlikeVideo(likedata: any) {
    try {
        console.log('reached@unlikeRepo');
        
        // Use MongoDB's `deleteOne` method to remove the document
        const result = await likedModel.deleteOne({
            videoId: likedata.videoId,
            userId: likedata.userId,
        });

        // Optionally, log the result to check the status
        console.log("Delete result:", result);

        return result;
    } catch (error) {
        console.error("Error deleting video like:", error);
        throw new Error('Failed to unlike the video');
    }
}





  async updateVideoViews(videoId: string) {
    try {
      const updatedVideo = await VideoModel.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } }, // Increment the views by 1
        { new: true } // Return the updated document
      );

      if (!updatedVideo) {
        console.error(`No video found with id: ${videoId}`);
        return null;
      }

      return updatedVideo;
    } catch (error) {
      console.error('Error updating video views:', error);
      throw error;
    }
  }



  async topviewdata() {
    try {

      const topdata = await VideoModel.find()
        .sort({ views: -1 })
        .limit(5);

      return topdata
    } catch (error) {
      console.error('Error updating video views:', error);
      throw error;
    }
  }


  async updateVideo(videoId: string, updatedFields: Partial<any>) {
    try {
      // Use Mongoose's findByIdAndUpdate method to update the video
      const video = await VideoModel.findByIdAndUpdate(videoId, updatedFields, { new: true });

      // Return the updated video or null if not found
      return video;
    } catch (error) {
      console.error('Error updating video:', error);
      throw new Error('Database update error');
    }
  }


  async findOthervideosByid(videoId: string): Promise<IvideoDocument[]> {
    try {
      // Use $ne (not equal) to find all videos except the one with the given videoId
      const videoDatas = await VideoModel.find({
        _id: { $ne: videoId }
      });

      if (!videoDatas || videoDatas.length === 0) {
        throw new Error(`No other videos found`);
      }
      return videoDatas;
    } catch (error) {
      console.error('Error fetching other videos:', error);
      throw error;
    }
  }


  async findv(filter: Record<string, any>): Promise<IvideoDocument[]> {
    try {
      const videos = await VideoModel.find(filter).exec(); // `VideoModel` is the Mongoose model for your videos
      return videos;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw new Error('Failed to fetch videos');
    }
  }
  


}
