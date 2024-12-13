
import { Visibility } from "../enums/visibility.enum";
import { IvideoDocument } from "../interfaces/IvideoDocument.interface";
import { IVideoRepository } from "../interfaces/Ivideorepo.interface";
import likedModel from "../models/likedVModel";
import noticeModel from "../models/noticeModel";
import reportModel from "../models/reportModel";
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
    const publicVideos = videos.filter(video => video.visibility === Visibility.PUBLIC);

    return publicVideos;
  }


  async getCategoryvideo(category: string): Promise<IvideoDocument[]> {
    return VideoModel.find({ category }); 

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
      return !!likedStatus; 
    } catch (error) {
      console.error("Error in findLikedStatus:", error);
      throw error;
    }
  }


  async getReportAboveTen() {
    try {
      // Fetch videos with report count > 10
      const videosWithHighReports = await VideoModel.find({ report: { $gt: 10 } });

      if (!videosWithHighReports.length) {
        return { message: 'No videos have more than 10 reports' };
      }

      const videoIds = videosWithHighReports.map((video) => video._id);

      const reportDetails = await reportModel.find({ videoId: { $in: videoIds } });

      const noticeDetails = await noticeModel.find({ videoId: { $in: videoIds } });
      const noticedVideoIds = new Set(noticeDetails.map((notice) => notice.videoId.toString()));

      const populatedVideos = videosWithHighReports.map((video) => {
        const reportsForVideo = reportDetails.filter(
          (report) => report.videoId.toString() === video._id.toString()
        );

        const reportReasons = reportsForVideo.flatMap((report: any) =>
          report.reasons.map((reason: any) => ({
            reason: reason.reason,
            reporterId: report.reporterId,
            reportedAt: report.reportedAt,
          }))
        );

        const noticeSent = noticedVideoIds.has(video._id.toString());

        return {
          videoDetails: video.toObject(),
          reportReasons,
          noticeSent,
        };
      });

      console.log('Populated Videos with Reports:', populatedVideos);

      return populatedVideos;
    } catch (error) {
      console.error('Error in getReportAboveTen:', error);
      throw error;
    }
  }



  async getReportedVideosByUserId(userId: string) {
    try {
      console.log('reached @repository');

      const reportedVideos = await reportModel.find({ uploaderId: userId });

      const videoIds = reportedVideos.map((report: any) => report.videoId);

      const videoDetails = await VideoModel.find({ _id: { $in: videoIds } });

      const noticeDetails = await noticeModel.find({ videoId: { $in: videoIds } });

      const noticedVideoIds = new Set(noticeDetails.map((notice) => notice.videoId.toString()));

      const populatedVideos = reportedVideos.map((report: any) => {
        const videoDetail = videoDetails.find((video: any) => video._id.toString() === report.videoId.toString());

        const noticeSent = noticedVideoIds.has(report.videoId.toString());

        return {
          ...report.toObject(),
          videoDetails: videoDetail || null,
          noticeSent,
        };
      });

      console.log("Populated Videos:", populatedVideos);

      return populatedVideos;
    } catch (error) {
      console.error("Error in getReportedVideosByUserId:", error);
      throw new Error('Failed to get reported videos');
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

      const saveLikeVideo = new likedModel(likedata);

      const result = await saveLikeVideo.save();

      return result;
    } catch (error) {
      console.error('Error saving video:', error);
      throw new Error('Failed to save video');
    }
  }

  async saveNoticedata(noticedata: any) {
    try {
      console.log('reached@vrepo');

      const existingNotice = await noticeModel.findOne({ videoId: noticedata.videoId });

      if (existingNotice) {
        console.log(`Notice already exists for videoId: ${noticedata.videoId}`);
        return { alreadyExists: true };
      }

      const data = {
        videoId: noticedata.videoId,
        notice: noticedata.noticemessage,
      };

      const savenoticedata = new noticeModel(data);

      const result = await savenoticedata.save();
      console.log(`Notice saved successfully for videoId: ${noticedata.videoId}`);
      return { alreadyExists: false, result };
    } catch (error) {
      console.error('Error saving notice:', error);
      throw new Error('Failed to save notice');
    }
  }



  async saveVerifieddata(videoId: string) {
    try {
      console.log('reached@vrepo', videoId);

      const deleteResult = await reportModel.deleteOne({ videoId });
      if (deleteResult.deletedCount === 0) {
        console.log(`No report found with videoId: ${videoId}`);
        return { message: `No report found with videoId: ${videoId}` };
      } else {
        console.log(`Report with videoId: ${videoId} deleted successfully.`);
      }


      const deleteNoticeResult = await noticeModel.deleteOne({ videoId });
      if (deleteNoticeResult.deletedCount === 0) {
        console.log(`No notice found with videoId: ${videoId}`);
      } else {
        console.log(`Notice with videoId: ${videoId} deleted successfully.`);
      }

      const updateResult = await VideoModel.updateOne(
        { _id: videoId },
        { $set: { report: 0 } }
      );

      if (updateResult.matchedCount === 0) {
        console.warn(`No video found with videoId: ${videoId}`);
        return { message: `No video found with videoId: ${videoId}` };
      } else {
        console.log(`Video with videoId: ${videoId} updated successfully.`);
      }

      return { message: 'Video verified successfully' };
    } catch (error) {
      console.error('Error saving video:', error);
      throw new Error('Failed to save report video data');
    }
  }




  async saveReportdata(reportdata: any) {
    try {
      console.log('Reached @ VideoRepository');

      const existingReport = await reportModel.findOne({ videoId: reportdata.videoId });

      if (existingReport) {

        const alreadyReported = await reportModel.findOne({
          videoId: reportdata.videoId,
          reasons: { $elemMatch: { reporterId: reportdata.reporterId } },
        });

        if (alreadyReported) {
          console.log('User has already reported this video.');
          return { message: 'You already reported this video' }; 
        }


        const updatedReport = await reportModel.updateOne(
          { videoId: reportdata.videoId },
          {
            $push: {
              reasons: {
                reporterId: reportdata.reporterId,
                reason: reportdata.reason,
              },
            },
          }
        );
        console.log('Report updated:', updatedReport);

        await VideoModel.updateOne(
          { _id: reportdata.videoId },
          { $inc: { report: 1 } }
        );

        return updatedReport;
      } else {
        const newReport = new reportModel({
          videoId: reportdata.videoId,
          uploaderId: reportdata.uploaderId,
          reasons: [
            {
              reporterId: reportdata.reporterId,
              reason: reportdata.reason,
            },
          ],
        });

        const result = await newReport.save();
        console.log('New report created:', result);

        await VideoModel.updateOne(
          { _id: reportdata.videoId },
          { $inc: { report: 1 } }
        );

        return result;
      }
    } catch (error) {
      console.error('Error saving video report:', error);
      throw new Error('Failed to save video report data');
    }
  }


  async findreportdatas(videoId: string) {
    try {

      const reportdata = await reportModel.find({ videoId })
      return reportdata
    } catch (error) {
      console.error('Error saving video report:', error);
      throw new Error('Failed to save video report data');
    }
  }





  async watchlaterVideo(watchlaterdata: any) {
    try {
      console.log('reached @vrepo');

      const existingVideo = await watchlaterModel.findOne({
        videoId: watchlaterdata.videoId,
        userId: watchlaterdata.userId,
      });

      if (existingVideo) {
        console.log('Video already exists in Watch Later');
        return { isAlreadySaved: true };
      }

      const savewatchlaterVideo = new watchlaterModel(watchlaterdata);

      const result = await savewatchlaterVideo.save();

      return { isAlreadySaved: false, data: result };
    } catch (error) {
      console.error('Error saving video:', error);
      throw new Error('Failed to save video');
    }
  }



  async unlikeVideo(likedata: any) {
    try {
      console.log('reached@unlikeRepo');

      const result = await likedModel.deleteOne({
        videoId: likedata.videoId,
        userId: likedata.userId,
      });

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
      const video = await VideoModel.findByIdAndUpdate(videoId, updatedFields, { new: true });

      return video;
    } catch (error) {
      console.error('Error updating video:', error);
      throw new Error('Database update error');
    }
  }


  async findOthervideosByid(videoId: string): Promise<IvideoDocument[]> {
    try {
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
      const videos = await VideoModel.find(filter).exec(); 
      return videos;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw new Error('Failed to fetch videos');
    }
  }



}
