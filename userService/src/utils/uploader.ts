import multer from 'multer';
import { ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import * as crypto from 'crypto'; 
import dotenv from 'dotenv'

dotenv.config()

const randomImageName = (bytes=32)=> crypto.randomBytes(bytes).toString('hex')

// Creating an S3 client with your credentials to communicate with s3 bucket
const s3Client = new S3Client({
    region: 'eu-north-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });


const storage = multer.memoryStorage(); 
// Initializing multer with the memory storage
const upload = multer({ storage });

// Create a function to handle the upload to S3
export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
    // Define parameters for S3 upload
    const uploadParams = {
        Bucket: 'profilepicutureupload', // Your S3 bucket name
        Key: randomImageName(), // File name with timestamp
        Body: file.buffer, // The file data stored in memory
        ContentType: file.mimetype, // Set content type from the file
        
    };

    // Uploading the file to S3
    try {
        await s3Client.send(new PutObjectCommand(uploadParams));
        // Returning the URL of the uploaded file
        return `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
    } catch (error) {
        console.error("Error uploading to S3:", error);
        throw new Error('Failed to upload file to S3');
    }
};
  

export default upload