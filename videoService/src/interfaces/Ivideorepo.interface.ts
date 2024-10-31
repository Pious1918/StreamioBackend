import { IvideoDocument } from "./IvideoDocument.interface";

export interface IVideoRepository {
  getvideo(): Promise<IvideoDocument[]>;
  findbyId(videoId: string): Promise<IvideoDocument>;
  uploadVideo(videoData: Partial<IvideoDocument>): Promise<IvideoDocument>;
}
