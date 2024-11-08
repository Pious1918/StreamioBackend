import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();


// Initialize S3 client with your credentials
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

    // Get the pre-signed URL using the getSignedUrl function
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



// export const uploadDirectoryToS3 = async (directoryPath: string, s3Prefix: string): Promise<void> => {
//   // Get the list of all files in the directory
//   const files = fs.readdirSync(directoryPath);

//   // Iterate over each file and upload it with the directory structure preserved
//   for (const file of files) {
//       const filePath = path.join(directoryPath, file);
//       const fileKey = path.join(s3Prefix, file).replace(/\\/g, '/'); // Replace backslashes with slashes for S3 compatibility

//       if (fs.lstatSync(filePath).isDirectory()) {
//           // If the current file is a directory, recursively upload it
//           await uploadDirectoryToS3(filePath, fileKey);
//       } else {
//           // Create a read stream for the file
//           const fileStream = fs.createReadStream(filePath);
//           const params = {
//               Bucket: 'streamiovideoupload',
//               Key: fileKey,
//               Body: fileStream,
//               ContentType: filePath.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp2t', // Use appropriate content type
//           };

//           try {
//               const command = new PutObjectCommand(params);
//               await s3Client.send(command);
//           } catch (err) {
//               throw new Error(`Failed to upload ${fileKey} to S3: ${err}`);
//           }
//       }
//   }
// };





export const uploadDirectoryToS3 = async (directoryPath: string, s3Prefix: string): Promise<string | null> => {
  const files = fs.readdirSync(directoryPath);
  let playlistKey: string | null = null; // Initialize a variable to hold the playlist key

  for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const fileKey = path.join(s3Prefix, file).replace(/\\/g, '/'); // S3 compatibility

      if (fs.lstatSync(filePath).isDirectory()) {
          // Recursively upload if it's a directory
          const nestedPlaylistKey = await uploadDirectoryToS3(filePath, fileKey);
          if (nestedPlaylistKey) {
              playlistKey = nestedPlaylistKey; // Capture the key if it's found
          }
      } else {
          // Upload the file
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
              
              // Check if this is the playlist file and store its key
              if (file.endsWith('playlist.m3u8')) {
                  playlistKey = fileKey;
              }
          } catch (err) {
              throw new Error(`Failed to upload ${fileKey} to S3: ${err}`);
          }
      }
  }


  console.log('playlistkey',playlistKey)
  return playlistKey; // Return the key of the playlist file (if found)
};
