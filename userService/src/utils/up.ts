// s3Service.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

// Initialize S3 client with your credentials
const s3Client = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const s3Clientforbanner = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_BANNERKEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_BANNERACCESS_KEY!,
  },
})

export const getPresignedUrl = async (fileName: string, fileType: string): Promise<string> => {
  const params = {
    Bucket: 'profilepicutureupload',
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



export const generatePresignedURL = async (bucketname: string, fileName: string, fileType: string,): Promise<string> => {
  const params = {
    Bucket: bucketname,
    Key: fileName,
  }

  try {
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3Clientforbanner, command, { expiresIn: 300 });
    return url;

  } catch (error) {
    console.error(error);
    throw new Error('Error generating presigned URL');
  }
}







const s3Clientdele = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_BANNERKEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_BANNERACCESS_KEY!,
  },
});

export const deleteImagefroms3 = async (url: string) => {
  try {

    const bucketname = 'bannerstreamio'
    const urlObj = new URL(url)
    const key = decodeURIComponent(urlObj.pathname.substring(1))

    const deleteParams = {
      Bucket: bucketname,
      Key: key
    }

    const deletecommand = new DeleteObjectCommand(deleteParams)
    const response = await s3Clientdele.send(deletecommand)
    console.log("image successfully deleted", response)

  } catch (error) {
    console.error('Error deleting the image:', error);

  }
}