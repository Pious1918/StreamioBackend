import { Request, Response } from "express";
import { getPresignedUrl } from "../utils/s3uploader";
import { IAuthRequest } from "../middleware/authmiddle";
import { videoService } from "../services/videoService";
import ffmpeg from 'fluent-ffmpeg';
// import fs from 'fs';
// import path from 'path';
import { IVideoController } from "../interfaces/Ivideocontroller.interface";





export class VideoController implements IVideoController {

    private _videoService: videoService
    constructor() {
        this._videoService = new videoService()

        // Set the path to ffmpeg executable
        ffmpeg.setFfmpegPath("C:\\ffmpeg\\bin\\ffmpeg.exe");
    }





    // public getVideo = async (req: IAuthRequest, res: Response) => {
    //     try {
    //         const { videoId } = req.params;
    //         const videoData = await this._videoService.findVideo(videoId);
    //         if (!videoData || !videoData.videolink) {
    //             res.status(404).send("Video not found");
    //             return;
    //         }

    //         const videolink = videoData.videolink;
    //         const tempFilePath = path.resolve(__dirname, `temp-${videoId}.mp4`);

    //         // Stream video using FFmpeg to a temporary file first
    //         ffmpeg(videolink)
    //             .inputOptions(['-re'])
    //             .videoCodec('libx264')
    //             .audioCodec('aac')
    //             .outputOptions([
    //                 '-preset veryfast',
    //                 '-maxrate 3000k',
    //                 '-bufsize 6000k',
    //                 '-pix_fmt yuv420p',
    //                 '-g 50',
    //                 '-r 30',
    //                 '-b:a 128k',
    //                 '-strict experimental'
    //             ])
    //             .output(tempFilePath)
    //             .on('end', () => {
    //                 console.log("Temporary video file created, streaming to client.");
    //                 res.setHeader('Content-Type', 'video/mp4');

    //                 // Stream the file to client
    //                 const readStream = fs.createReadStream(tempFilePath);
    //                 readStream.pipe(res);

    //                 // Clean up after the stream ends
    //                 readStream.on('end', () => {
    //                     fs.unlinkSync(tempFilePath); // Delete temp file after streaming
    //                     console.log("Streaming finished, temporary file deleted.");
    //                 });

    //                 // Handle any errors in the read stream
    //                 readStream.on('error', (streamErr) => {
    //                     console.error("Error streaming video to client:", streamErr.message);
    //                     if (!res.headersSent) {
    //                         res.status(500).send("Error streaming video");
    //                     }
    //                 });
    //             })
    //             .on('error', (err) => {
    //                 console.error("Error creating temporary video file:", err.message);
    //                 if (!res.headersSent) {
    //                     res.status(500).send("Error streaming video");
    //                 }
    //             })
    //             .run();
    //     } catch (error) {
    //         console.error("Error in getVideo:", error);
    //         if (!res.headersSent) {
    //             res.status(500).send("Internal server error");
    //         }
    //     }
    // };



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





            // Define the path for HLS files
            // const hlsFolderPath = path.resolve(__dirname, `../../hls/hls-${videoId}`);
            // const hlsPlaylistPath = path.join(hlsFolderPath, 'index.m3u8');

            // // Check if HLS output folder exists
            // if (!fs.existsSync(hlsFolderPath)) {
            //     fs.mkdirSync(hlsFolderPath);
            // }

            // // Check if HLS playlist already exists
            // if (fs.existsSync(hlsPlaylistPath)) {
            //     console.log("HLS playlist already exists, streaming to client");
            //     const hlsUrl = `${req.protocol}://${req.get('host')}/hls/hls-${videoId}/index.m3u8`;
            //     console.log("hlser url", hlsUrl)
            //     res.json({ message: 'haii' })
            //     return

            // }

            // // Convert mp4 to HLS format with FFMPEG
            // ffmpeg(videolink)
            //     .videoCodec('libx264')
            //     .audioCodec('aac')
            //     .outputOptions([
            //         '-preset veryfast',
            //         '-g 48',                   // Group of Pictures
            //         '-hls_time 10',            // Duration of each segment in seconds
            //         '-hls_list_size 0',        // Keep all segments in the playlist
            //         '-f hls',
            //         '-hls_segment_filename', path.join(hlsFolderPath, 'segment-%03d.ts')
            //     ])
            //     .output(hlsPlaylistPath)
            //     .on('end', () => {
            //         console.log("HLS conversion completed, stream to client");
            //         res.sendFile(hlsPlaylistPath, (err) => {
            //             if (err) {
            //                 console.log("error sending hls playlist", err.message);
            //                 res.status(500).send("error streaming video");
            //             }
            //         });
            //     })
            //     .on('error', (err) => {
            //         console.log("error creating hls video", err.message);
            //         if (!res.headersSent) {
            //             res.status(500).send("error processing video");
            //         }
            //     })
            //     .run();

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
