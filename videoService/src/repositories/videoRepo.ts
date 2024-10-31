
import { Visibility } from "../enums/visibility.enum";
import { IvideoDocument } from "../interfaces/IvideoDocument.interface";
import { IVideoRepository } from "../interfaces/Ivideorepo.interface";
import VideoModel from "../models/videoModel";
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

  async uploadVideo(videoData: Partial<IvideoDocument>): Promise<IvideoDocument> {
    console.log('reached@vrepo')
    const savedVideo = await this.save(videoData);


    if (!savedVideo) {
      throw new Error("Failed to save video");
    }

    return savedVideo;
  }
}
