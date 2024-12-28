import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';


dotenv.config();
const s3Client = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const getPresignedUrl = async (fileName: string, fileType: string): Promise<string> => {
  const params = {
    Bucket: 'streamiovideoupload',
    Key: fileName,
    ContentType: fileType,
  };

  try {

    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    return url;

  } catch (err) {
    throw new Error(`Failed to create a pre-signed URL: ${err}`);
  }
};


export const uploadToS3 = async (key: string, filePath: string): Promise<void> => {
  const fileStream = fs.createReadStream(filePath);
  const params = {
    Bucket: 'streamiovideoupload',
    Key: key,
    Body: fileStream,
    ContentType: filePath.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp2t', // Use appropriate content type
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
  } catch (err) {
    throw new Error(`Failed to upload to S3: ${err}`);
  }
};



export const uploadDirectoryToS3 = async (directoryPath: string, s3Prefix: string): Promise<string | null> => {
  const files = fs.readdirSync(directoryPath);
  let playlistKey: string | null = null;

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const fileKey = path.join(s3Prefix, file).replace(/\\/g, '/');

    if (fs.lstatSync(filePath).isDirectory()) {

      const nestedPlaylistKey = await uploadDirectoryToS3(filePath, fileKey);
      if (nestedPlaylistKey) {
        playlistKey = nestedPlaylistKey;
      }

    } else {

      const fileStream = fs.createReadStream(filePath);
      const params = {
        Bucket: 'streamiovideoupload',
        Key: fileKey,
        Body: fileStream,
        ContentType: filePath.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp2t',
      };

      try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        if (file.endsWith('playlist.m3u8')) {
          playlistKey = fileKey;
        }

      } catch (err) {
        throw new Error(`Failed to upload ${fileKey} to S3: ${err}`);
      }
    }
  }

  return playlistKey;

};
