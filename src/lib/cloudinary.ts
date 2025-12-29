// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dst7xhenb',
  api_key: process.env.CLOUDINARY_API_KEY || '647239969244765',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Zy0Uk_EROVK83Y4cIsc4qr2Fjgc',
  secure: true
});

export interface UploadResult {
  url: string;
  public_id: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'medivault/reports'
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        filename_override: fileName,
        use_filename: true,
        unique_filename: true,
        timeout: 60000 // 60 seconds timeout for large files
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height
          });
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete from Cloudinary:', error);
    // Don't throw - we'll still delete from DB even if Cloudinary delete fails
  }
}

export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  } catch (error) {
    return null;
  }
}