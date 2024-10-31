import { IvideoDocument } from "./IvideoDocument.interface";

export interface IVideoService {
  getVideos(): Promise<IvideoDocument[] | undefined>;
  findVideo(videoId: string): Promise<IvideoDocument | undefined>;
  saveVideo(videodata: Partial<IvideoDocument>, userId: string): Promise<IvideoDocument>;
  getVideoUploadedbyUser(userId: string): Promise<IvideoDocument | undefined>;
}
