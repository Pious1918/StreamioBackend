import amqp from 'amqplib'
// import { videoService } from '../services/videoService';
import path from 'path'
import fs from 'fs'
import Ffmpeg from 'fluent-ffmpeg'
import { uploadDirectoryToS3 } from '../utils/s3uploader';
import { videoService } from '../services/videoService';





const RABBITMQ_URL = 'amqp://rabbitmq.streamio.svc.cluster.local';
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
            Ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');  // or use '/usr/local/bin/ffmpeg' based on the FFmpeg location

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

                        // Optionally delete temporary files after uploading to s3 bucket
                        fs.rmSync(hlsOutputPath, { recursive: true });
                        console.log("Uploaded to S3 with key:", playlistKey);

                        // Saving the video details to the database
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














//////////////////////
///this will allow to convert the video to different qualities


// export async function startWorker() {
//   const connection = await amqp.connect(RABBITMQ_URL);
//   const channel = await connection.createChannel();
//   const queue = 'video_conversion_queue';

//   await channel.assertQueue(queue, { durable: true });
//   console.log(`Waiting for messages in ${queue}.`);

//   channel.consume(queue, async (msg) => {
//     if (msg !== null) {
//       const message = JSON.parse(msg.content.toString());
//       const { userId, title, description, visibility, payment, price, fileUrl, fileName } = message;

//       const mainFolderPath = path.join(__dirname, '../../public', fileName);
//       if (!fs.existsSync(mainFolderPath)) {
//         fs.mkdirSync(mainFolderPath, { recursive: true });
//       }

//       const qualities = [
//         { resolution: '1920x1080', bitrate: '3000k', quality: 'high' },
//         { resolution: '1280x720', bitrate: '1500k', quality: 'medium' },
//         { resolution: '640x360', bitrate: '500k', quality: 'low' }
//       ];

//       const uploadPromises = qualities.map((quality) => {
//         return new Promise<void>((resolve, reject) => {
//           const qualityFolderPath = path.join(mainFolderPath, quality.quality);
//           if (!fs.existsSync(qualityFolderPath)) {
//             fs.mkdirSync(qualityFolderPath, { recursive: true });
//           }

//           const playlistPath = path.join(qualityFolderPath, `playlist_${quality.quality}.m3u8`);
//           const hlsSegmentPath = path.join(qualityFolderPath, `segment_${quality.quality}_%03d.ts`);

//           Ffmpeg(fileUrl)
//             .output(playlistPath)
//             .outputOptions([
//               '-preset fast',
//               '-g 48',
//               '-sc_threshold 0',
//               '-map 0',
//               '-c:a aac',
//               '-ar 48000',
//               '-b:a 128k',
//               '-c:v h264',
//               '-profile:v main',
//               '-crf 20',
//               `-b:v ${quality.bitrate}`,
//               `-maxrate ${quality.bitrate}`,
//               '-bufsize 2000k',
//               '-hls_time 10',
//               '-hls_playlist_type vod',
//               '-hls_segment_filename', hlsSegmentPath,
//               '-s', quality.resolution
//             ])
//             .on('end', async () => {
//               console.log(`Conversion complete for quality ${quality.quality}. Uploading to S3...`);
//               try {
//                 const playlistKey = await uploadDirectoryToS3(qualityFolderPath, `${fileName}/${quality.quality}/`);

//                 console.log(`Uploaded to S3 with key: ${playlistKey}`);
//                 resolve();
//               } catch (error) {
//                 console.error('Error uploading to S3:', error);
//                 reject(error);
//               }
//             })
//             .on('error', (err) => {
//               console.error(`FFmpeg error for quality ${quality.quality}:`, err);
//               reject(err);
//             })
//             .run();
//         });
//       });

//       try {
//         await Promise.all(uploadPromises);

//         console.log(userId, title, description, visibility, payment, price)
//         console.log( `high: ${fileName}/high/playlist_high.m3u8`,
//                   ` medium: ${fileName}/medium/playlist_medium.m3u8`,
//                   `low: ${fileName}/low/playlist_low.m3u8`)
//         // // Collect playlist keys and save to MongoDB
//         // const savedVideo = await videoservice.saveVideo(
//         //   {
//         //     title,
//         //     description,
//         //     visibility,
//         //     paid: payment,
//         //     price,
//         //     videolinks: {
//         //       high: `${fileName}/high/playlist_high.m3u8`,
//         //       medium: `${fileName}/medium/playlist_medium.m3u8`,
//         //       low: `${fileName}/low/playlist_low.m3u8`
//         //     },
//         //   },
//         //   userId
//         // );

//         // console.log(`Video saved successfully in the database:`, savedVideo);

//         // Clean up temporary files
//         fs.rmSync(mainFolderPath, { recursive: true });
//       } catch (error) {
//         console.error('Error in video processing workflow:', error);
//       }

//       // Acknowledge the message
//       channel.ack(msg);
//     }
//   });
// }























