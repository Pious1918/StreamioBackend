import amqp from 'amqplib'
import path from 'path'
import fs from 'fs'
import Ffmpeg from 'fluent-ffmpeg'
import { uploadDirectoryToS3 } from '../utils/s3uploader';
import { videoService } from '../services/videoService';





const RABBITMQ_URL = 'amqp://rabbitmq';
const videoservice = new videoService()

export async function startWorker(){
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'video_conversion_queue';

    await channel.assertQueue(queue , {durable : true});
    console.log(`waiting for messages in ${queue}.`)

    channel.consume(queue , async(msg)=>{
        
        if(msg!==null){
            const message = JSON.parse(msg.content.toString());
            const {userId, title, description, visibility, payment, price, videoUrl, fileName , thumbnailUrl , category} =message



            const hlsOutputPath = path.join(__dirname, '../../public', `${fileName}-hls`);
            if (!fs.existsSync(hlsOutputPath)) {
                fs.mkdirSync(hlsOutputPath, { recursive: true });
            }

            const playlistPath = path.join(hlsOutputPath, 'playlist.m3u8');
            const hlsSegmentPath = path.join(hlsOutputPath, 'segment_%03d.ts');
            Ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');  

            Ffmpeg(videoUrl)
                .output(playlistPath)
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
                    '-hls_segment_filename', hlsSegmentPath,
                ])
                .on('end', async () => {
                    console.log('Conversion complete. Uploading to S3...');
                    try {
                        const playlistKey = await uploadDirectoryToS3(hlsOutputPath, `${fileName}/`);

                        fs.rmSync(hlsOutputPath, { recursive: true });
                        console.log("Uploaded to S3 with key:", playlistKey);

                        const savedVideo = await videoservice.saveVideo(
                            {
                                title,
                                description,
                                visibility,
                                paid: payment,
                                price,
                                videolink: playlistKey as string,
                                category:category,
                                thumbnail:thumbnailUrl
                            },
                            userId
                        );

                        console.log("Video saved successfully in the database:", savedVideo);

                    } catch (error) {
                        console.error('Error uploading to S3:', error);
                    }
                })
                .on('error', err => {
                    console.error('FFmpeg error:', err);
                })
                .run();

               
            channel.ack(msg); 
        }
    })
}
























