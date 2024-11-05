import { Request, Response } from "express";
import { getPresignedUrl } from "../utils/s3uploader";
import { IAuthRequest } from "../middleware/authmiddle";
import { videoService } from "../services/videoService";
import ffmpeg from 'fluent-ffmpeg';
// import fs from 'fs';
// import path from 'path';
import { IVideoController } from "../interfaces/Ivideocontroller.interface";
// import path from "path";
// import fs from 'fs';
// import Ffmpeg from "fluent-ffmpeg";


import fs from 'fs';
import path from 'path';
import Ffmpeg from 'fluent-ffmpeg';



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


            console.log("filename",fileName)
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
                        
                        console.log("pahty",path.join(__dirname,"../../public",`${fileName}-hls`,"playlist.m3u8"))
                        
                        res.sendFile(path.join(__dirname,"../../public",`${fileName}-hls`,"playlist.m3u8"))
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
                console.log('absolute path is ',absolutePath)
                const hlsUrl = `http://localhost:5002/${fileName}-hls/playlist.m3u8`; // Update the port as needed
                res.json({url:hlsUrl});
           
            }
        } catch (error) {
            console.error("Server-side error:", error);
            res.status(500).json({ message: 'Server-side error', error: "error.message" });
        }
    }



    public getVideo = async (req: IAuthRequest, res: Response) => {
        try {
            const { videoId } = req.params;
            const videoData = await this._videoService.findVideo(videoId);
            if (!videoData || !videoData.videolink) {
                res.status(404).send("Video not found");
                return;
            }

            const videolink = videoData.videolink;
            if (videolink) {
                res.status(200).json(videoData)
            }


        } catch (error) {
            console.error(error);
            res.status(500).send("Internal server error");
        }
    }




    public getVideos = async (req: IAuthRequest, res: Response) => {
        try {

            const videos = await this._videoService.getVideos()

            console.log("videos @conter", videos)
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





    public getUseruploadedvideo = async (req: IAuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        console.log("REsacahed herererere", userId)
        if (!userId) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }

        try {
            console.log("reached again")
            const videos = await this._videoService.getVideoUploadedbyUser(userId);
            res.status(200).json(videos);
        } catch (error) {
            console.error("Error fetching videos:", error);
            res.status(500).json({ error: "An error occurred while fetching videos" });
        }
    };


}
