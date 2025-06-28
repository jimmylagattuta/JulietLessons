import AWS from 'aws-sdk';
import { UploadResponse } from '../types/index.js';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'activity-scripts-bucket';

export async function uploadToS3(
  file: Express.Multer.File,
  folder: string = 'scripts'
): Promise<UploadResponse> {
  try {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();

    return {
      success: true,
      fileUrl: result.Location,
      fileName: file.originalname
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: 'Failed to upload file to S3'
    };
  }
}

export async function deleteFromS3(fileUrl: string): Promise<boolean> {
  try {
    const key = fileUrl.split('/').slice(3).join('/'); // Extract key from URL
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    return false;
  }
}