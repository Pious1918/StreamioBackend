import { Request, Response } from "express";
import { getPresignedUrl, } from "../utils/s3uploader";
import { IAuthRequest } from "../middleware/authmiddle";
import { videoService } from "../services/videoService";
import ffmpeg from 'fluent-ffmpeg';

import { IVideoController } from "../interfaces/Ivideocontroller.interface";

import amqp from 'amqplib';

// import crypto from 'crypto'
import fs from 'fs';
import path, { resolve } from 'path';
import Ffmpeg from 'fluent-ffmpeg';
import { client, client2 } from "../client";
import likedModel from "../models/likedVModel";
import redisClient from "../utils/redisClient";

// const randomVideoName = (bytes=32)=>crypto.randomBytes(bytes).toString('hex')
const RABBITMQ_URL = 'amqp://rabbitmq'; // RabbitMQ URL, 

interface CommentResponse {
    comments: Array<string>; // Replace `any` with the specific type of comment
}

interface UserResponse {
    name: string,
    email: string
}

interface GetCommentsError {
    code: number;
    details: string;
}


export class VideoController implements IVideoController {

    private _videoService: videoService
    constructor() {
        this._videoService = new videoService()

        // Set the path to ffmpeg executable
        ffmpeg.setFfmpegPath("C:\\ffmpeg\\bin\\ffmpeg.exe");
    }








    public getHlsVideo = async (req: IAuthRequest, res: Response) => {
        console.log("Approached getHlsVideo");

        try {
            const { videoId } = req.params;

            // Retrieve video information
            const videoData = await this._videoService.findVideo(videoId);
            if (!videoData || !videoData.videolink) {
                res.status(404).send("Video not found");
                return;
            }

            const videolink = videoData.videolink;
            console.log("Video link:", videolink);

            // Define paths
            const fileName = path.basename(videolink, path.extname(videolink));
            const hlsOutputPath = path.join('./public', `${fileName}-hls`);
            const playlistPath = path.join(hlsOutputPath, 'playlist.m3u8');


            console.log("filename", fileName)
            // Check if the playlist file already exists
            if (!fs.existsSync(playlistPath)) {
                console.log("HLS playlist does not exist, creating it...");

                // Create output directory if it doesn't exist
                if (!fs.existsSync(hlsOutputPath)) {
                    try {
                        fs.mkdirSync(hlsOutputPath, { recursive: true });
                        console.log("Created directory for HLS output:", hlsOutputPath);
                    } catch (error) {
                        console.error("Directory creation error:", error);
                        res.status(500).send("Error creating directory");
                        return;
                    }
                }

                // Convert video to HLS format using ffmpeg
                Ffmpeg(videolink) // Use videolink here, not videoId
                    .output(playlistPath) // Explicitly set the output path
                    .outputOptions([
                        '-preset fast',
                        '-g 48',
                        '-sc_threshold 0',
                        '-map 0',
                        '-c:a aac',
                        '-ar 48000',
                        '-b:a 128k',
                        '-c:v h264',
                        '-profile:v main',
                        '-crf 20',
                        '-b:v 1000k',
                        '-maxrate 1000k',
                        '-bufsize 2000k',
                        '-hls_time 10',
                        '-hls_playlist_type vod',
                        '-hls_segment_filename', `${hlsOutputPath}/segment_%03d.ts`
                    ])
                    .on('end', () => {
                        // console.log(`Conversion complete. HLS URL: /hls-output/${fileName}/playlist.m3u8`);
                        console.log(hlsOutputPath);

                        console.log("pahty", path.join(__dirname, "../../public", `${fileName}-hls`, "playlist.m3u8"))

                        res.sendFile(path.join(__dirname, "../../public", `${fileName}-hls`, "playlist.m3u8"))
                    })
                    .on('error', err => {
                        console.error('FFmpeg error:', err);
                        res.status(500).send('Error processing video');
                    })
                    .run();
            } else {
                console.log("Serving existing HLS playlist");
                console.log(hlsOutputPath);
                console.log(fileName)
                console.log("HLS Output Path (absolute):", path.resolve(hlsOutputPath));
                const absolutePath = path.resolve(__dirname, "../../public", `${fileName}-hls`, "playlist.m3u8");
                console.log('absolute path is ', absolutePath)
                const hlsUrl = `http://localhost:5002/${fileName}-hls/playlist.m3u8`; // Update the port as needed
                res.json({ url: hlsUrl });

            }
        } catch (error) {
            console.error("Server-side error:", error);
            res.status(500).json({ message: 'Server-side error', error: "error.message" });
        }
    }

    public getVideo = async (req: IAuthRequest, res: Response) => {
        try {
            const { videoId } = req.params;

            const userId: any = req.user?.userId

            // Fetch video data
            const videoData = await this._videoService.findVideo(videoId);
            if (!videoData || !videoData.videolink) {
                res.status(404).send("Video not found");
                return;
            }

            const uploaderId = videoData.uploaderId;

            // Helper function to promisify gRPC calls
            const fetchComments = (videoId: string): Promise<any[]> => {
                return new Promise((resolve, reject) => {
                    client.getComments({ videoId }, (error: GetCommentsError | null, response: CommentResponse | null) => {
                        if (error) {
                            return reject(error);
                        }
                        const comments = (response?.comments || []).map((comment: any) => ({
                            id: comment.id,
                            username: comment.username,
                            content: comment.content,
                            replies: (comment.replies || []).map((reply: any) => ({
                                userId: reply.userId,
                                username: reply.username,
                                content: reply.content,
                                createdAt: reply.createdAt,
                            })),
                        }));

                        console.log("all comments are")
                        resolve(comments);
                    });
                });
            };

            const fetchUploaderData = (uploaderId: string): Promise<any> => {
                return new Promise((resolve, reject) => {
                    client2.GetChannelDetails({ _id: uploaderId }, (error: any, response: UserResponse) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve({
                            name: response.name,
                            email: response.email,
                        });
                    });
                });
            };


            const fetchviewerDetails = (viewerId: string): Promise<any> => {
                return new Promise((resolve, reject) => {
                    client2.GetViewerDetails({ _id: viewerId }, (error: any, response: any) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve({
                            name: response.name,
                            email: response.email,
                            following: response.following || []
                        });
                        console.log("response of viewer datat")
                    })
                })
            }

            // Fetch both comments and uploader data concurrently
            const [comments, uploaderData] = await Promise.all([
                fetchComments(videoId),
                fetchUploaderData(uploaderId),
                // fetchviewerDetails(userId)
            ]);

            let subscribed: string | boolean = false;

            if (userId === uploaderId) {
                subscribed = "same";
            } else {
                const viewerData = await fetchviewerDetails(userId);
                if (Array.isArray(viewerData.following) && viewerData.following.includes(uploaderId)) {
                    subscribed = true;
                } else {
                    subscribed = false; // Default to not subscribed
                }
            }


            const likedStatus = await likedModel.findOne({ userId, videoId })

            const isLiked = await this._videoService.getLikedStatus(userId, videoId);





            // Combine data into a single response
            const responseData = {
                ...videoData,
                comments,
                uploader: uploaderData,
                subscribed,
                isLiked
            };

            res.status(200).json(responseData);
        } catch (error) {
            console.error("Error in getVideo:", error);
            res.status(500).send("Internal server error");
        }
    };



    public topfive = async (req: Request, res: Response) => {
        try {
            const top = await this._videoService.topViewed()
            res.status(200).json({ top })
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal server error");
        }
    }




    public fetchOthers = async (req: IAuthRequest, res: Response) => {


        try {
            const { videoId } = req.params;
            const videoDatas = await this._videoService.findOtherVideos(videoId);
            res.status(200).json({ message: 'fetched succesully', video: videoDatas })
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal server error");
        }
    }


    public getReportReason = async (req: IAuthRequest, res: Response) => {


        try {
            const { videoId } = req.params;
            console.log("video id @ getreportreason on controller", videoId)
            const reportreason = await this._videoService.getAllreports(videoId)
            // const videoDatas = await this._videoService.findOtherVideos(videoId);
            res.status(200).json({ message: 'Report reasons fetched succesully', reportreason })
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal server error");
        }
    }


    public postcomment = async (req: IAuthRequest, res: Response) => {
        try {
            const { videoId, content } = req.body
            const userId = req.user?.userId

            client.postComment({ userId, videoId, content }, (error: any, response: any) => {
                if (error) {
                    console.error('error posting comment:', error)
                    res.status(500).json("failed to post comment")
                }

                const newComment = JSON.parse(response.comment)
                client.forEach((client: any) => {
                    client.send(JSON.stringify({ videoId, newComment }))
                })

                res.status(200).json(response)
            })
        } catch (error) {
            console.error(error)
        }
    }





    public getVideos = async (req: IAuthRequest, res: Response) => {
        try {


            const tab = req.query.tab as string; // Extract the tab value from the query parameters
            console.log("Tab value received:", tab);
            let videos;

            if (tab && tab !== 'All') {
                // Fetch videos based on the tab value
                videos = await this._videoService.getVideosByCategory(tab);
            } else {
                // Fetch all videos if no specific tab or 'All' is selected
                videos = await this._videoService.getVideos();
            }


            // const videos = await this._videoService.getVideos()

            console.log("videos @conter")
            res.status(200).json(videos)

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Error fetching videos" })
        }
    }










    public genPresignedurl = async (req: Request, res: Response) => {
        const { fileName, fileType } = req.body
        try {
            const presignedUrl = await getPresignedUrl(fileName, fileType);
            res.json({ presignedUrl });
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: "hai" });
        }
    }


    public videoViews = async (req: Request, res: Response) => {
        try {
            const { videoId } = req.body
            console.log("video id for increment views", videoId)
            const videodata = this._videoService.incrementViews(videoId)

            res.status(200).json({ message: 'views updated' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "didnt update" });
        }
    }

    public savewatchlater = async (req: IAuthRequest, res: Response) => {
        try {
            const { videoId } = req.body;
            const userId = req.user?.userId;

            console.log("video id for savewatchlater", videoId);

            const watchlaterData = {
                userid: userId,
                videoid: videoId,
            };

            const result = await this._videoService.savewatchlater(watchlaterData);

            if (result.isAlreadySaved) {
                res.status(200).json({ message: 'Video is already saved to Watch Later' });
                return
            }

            res.status(200).json({ message: 'Video saved to Watch Later' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to update Watch Later" });
        }
    };





    public likeVideo = async (req: IAuthRequest, res: Response) => {
        try {
            const userId = req.user?.userId
            console.log("user id @likevideo", userId)
            const { videoId } = req.body
            console.log("videoId", videoId)
            const likedata = {
                userid: userId,
                videoid: videoId
            }
            const updateLike = this._videoService.likevideo(likedata)
            res.status(200).json({ message: 'video liked successfully' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'error from likevideo' })
        }
    }


    public unlikeVideo = async (req: IAuthRequest, res: Response) => {
        try {
            const userId = req.user?.userId;
            console.log("user id @unlikeVideo", userId);

            const { videoId } = req.body;
            console.log("videoId", videoId);

            // Call the service to handle the unlike logic
            await this._videoService.unlikeVideo({ userId, videoId });

            res.status(200).json({ message: 'Video unliked successfully' });
        } catch (error) {
            console.error("Error in unlikeVideo:", error);
            res.status(500).json({ error: 'Error while unliking the video' });
        }
    }




    // **-------------------------------------------------------------------------
    public convertToHLS = async (req: IAuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId

        if (!userId) {
            res.status(403).json({ error: 'userid is missing in the token' })
            return
        }

        const { title, description, visibility, payment, price, videoUrl, thumbnailUrl, category } = req.body;
        const fileName = path.basename(videoUrl, path.extname(videoUrl));

        try {
            // Connect to RabbitMQ and create a channel
            const connection = await amqp.connect(RABBITMQ_URL);
            const channel = await connection.createChannel();
            const queue = 'video_conversion_queue';

            // Ensure the queue exists
            await channel.assertQueue(queue, { durable: true });

            // Prepare message data for video conversion
            const message = {
                userId,
                title,
                description,
                visibility,
                payment,
                price,
                videoUrl,
                fileName,
                thumbnailUrl,
                category
            };

            // Send message to the queue
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                persistent: true,
            });

            console.log('Video conversion task sent to RabbitMQ');
            res.status(200).json({ message: 'Video conversion task sent successfully' });

            // Close the channel and connection
            setTimeout(() => {
                channel.close();
                connection.close();
            }, 500);
        } catch (error) {
            console.error('Error sending task to RabbitMQ:', error);
            res.status(500).send('Error processing video conversion');
        }

    }


















    public videoDataSave = async (req: IAuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;

        // Check if userId is present
        if (!userId) {
            res.status(403).json({ error: 'User ID is missing in token' });
            return;
        }

        console.log("req.body", req.body)
        // Destructure and validate required fields
        const { title, description, visibility, payment, price, fileUrl } = req.body;
        console.log("ti", title)
        console.log('des', description)
        if (!title || !description) {

            console.log("error @controller")
            res.status(400).json({ error: 'Title and description are required fields.' });
            return;
        }

        try {
            console.log("reacherd controller")
            const savedVideo = await this._videoService.saveVideo(
                { title, description, visibility, paid: payment, price, videolink: fileUrl },
                userId
            );

            res.status(200).json({ message: 'Video saved successfully', data: savedVideo });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to save video' });
        }
    };



    public saveReportVideoData = async (req: IAuthRequest, res: Response): Promise<void> => {

        try {

            const reporterId = req.user?.userId

            if (!reporterId) {
                res.status(403).json({ error: 'User ID is missing in token' });
                return;
            }


            const { reportVideodata } = req.body
            console.log("report video data are ", reportVideodata)

            const saveReportVideoData: any = await this._videoService.saveReportdata(reportVideodata, reporterId)

            // Check if the service returned a specific message
            if (saveReportVideoData.message === 'You already reported this video') {
                res.status(200).json({ message: saveReportVideoData.message }); // Send the specific message as a response
                return;
            }

            res.status(200).json({ message: 'Video reported successfully', data: saveReportVideoData });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to save video' });
        }
    };

    public verifybyadmin = async (req: IAuthRequest, res: Response): Promise<void> => {
        try {
            const { videoId } = req.body;

            console.log("verify video id @ controller", videoId);

            const verifyResult = await this._videoService.verifyVedio(videoId);

            if (verifyResult.success) {
                res.status(200).json({ message: 'Video verified successfully', data: verifyResult.data });
            } else {
                res.status(404).json({ message: verifyResult.message });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to verify video' });
        }
    };


    public verifybyuser = async (req: IAuthRequest, res: Response): Promise<void> => {
        try {
            const { videoId } = req.body;

            console.log("verify video id @ controller", videoId);

            const verifyResult = await this._videoService.verifyVedio(videoId);

            if (verifyResult.success) {
                res.status(200).json({ message: 'Video verified successfully', data: verifyResult.data });
            } else {
                res.status(404).json({ message: verifyResult.message });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to verify video' });
        }
    };


    public noticebyadmin = async (req: IAuthRequest, res: Response): Promise<void> => {
        try {
            const { noticedata } = req.body;
    
            console.log("noticedata @ controller", noticedata);
    
            const result = await this._videoService.sendnotice(noticedata);
    

            if (result.success) {
                res.status(200).json({ message: result.message });
            } else {
                res.status(200).json({ message: result.message });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to send notice' });
        }
    };
    






    public getUseruploadedvideo = async (req: IAuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        console.log("Reached here", userId);

        if (!userId) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }

        try {
            console.log("Reached again");
            const videos = await this._videoService.getVideoUploadedbyUser(userId);

            // Check if no videos are found
            if (videos.length === 0) {
                res.status(200).json({ message: "No videos uploaded by this user." });
            } else {
                res.status(200).json(videos);
            }
        } catch (error) {
            console.error("Error fetching videos:", error);
            res.status(500).json({ error: "An error occurred while fetching videos" });
        }
    };




    public likedVideos = async (req: IAuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        console.log("REsacahed herererere", userId)
        if (!userId) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }

        try {
            console.log("reached again")
            const videos = await this._videoService.getlikedvideos(userId);
            res.status(200).json({ videos, message: 'fetched successfully' });
        } catch (error) {
            console.error("Error fetching videos:", error);
            res.status(500).json({ error: "An error occurred while fetching videos" });
        }
    };

    public getwatchlatervideos = async (req: IAuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        console.log("REsacahed herererere", userId)
        if (!userId) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }

        try {
            console.log("reached again")
            const videos = await this._videoService.getwatchlaterVideos(userId);
            res.status(200).json({ videos, message: 'fetched successfully' });
        } catch (error) {
            console.error("Error fetching videos:", error);
            res.status(500).json({ error: "An error occurred while fetching videos" });
        }
    };

    public getReportedvideos = async (req: IAuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        console.log("REsacahed herererere", userId)
        if (!userId) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }

        try {
            console.log("reached again")
            const videos = await this._videoService.getreportVideos(userId);
            res.status(200).json({ videos, message: 'reported fetched successfully' });
        } catch (error) {
            console.error("Error fetching videos:", error);
            res.status(500).json({ error: "An error occurred while fetching videos" });
        }
    };


    public getReportedVAdmin = async (req: IAuthRequest, res: Response): Promise<void> => {
        console.log("REsacahed herererere")


        try {
            console.log("reached again")
            const videos = await this._videoService.getreportVideoAdmin();
            res.status(200).json({ videos, message: 'reported fetched successfully' });
        } catch (error) {
            console.error("Error fetching videos:", error);
            res.status(500).json({ error: "An error occurred while fetching videos" });
        }
    };

    public getPrivatevideos = async (req: IAuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        console.log("REsacahed herererere", userId)
        if (!userId) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }

        try {
            console.log("reached again")
            const videos = await this._videoService.getprivatevideos(userId);

            if (!videos) {
                res.status(200).json({ message: 'there is no private video' });

            }
            else {
                res.status(200).json({ videos, message: 'fetched successfully' });

            }
        } catch (error) {
            console.error("Error fetching videos:", error);
            res.status(500).json({ error: "An error occurred while fetching videos" });
        }
    };


    public updatevideodata = async (req: Request, res: Response): Promise<void> => {
        const videoId = req.params.id;
        const updatedFields = req.body;

        try {
            console.log("vid $ data", videoId, updatedFields)

            const updatedVideo = await this._videoService.updateVideoData(videoId, updatedFields);

            if (!updatedVideo) {
                res.status(404).json({ message: 'Video not found' });
            }

            res.status(200).json({ message: 'Video updated successfully', video: updatedVideo });
        } catch (error) {

        }
    }


}
