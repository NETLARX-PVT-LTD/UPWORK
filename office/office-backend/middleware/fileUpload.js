// app.js (or server.js) — first line
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File filter to only allow PDF and image files (JPEG, JPG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files (JPEG, JPG, PNG) are allowed'), false);
  }
};

// Simple upload middleware that uses Cloudinary for all files in production
const createUpload = () => {
  return (req, res, next) => {
    // In production (Vercel), always use Cloudinary for all files
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 }, // 10MB limit
      fileFilter
    }).array('attachments', 5);

    upload(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return next(err);
      }

      if (!req.files || req.files.length === 0) {
        return next();
      }

      const processedFiles = [];

      try {
        for (const file of req.files) {
          const isPdf = file.mimetype === 'application/pdf';
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const publicId = file.fieldname + '-' + uniqueSuffix;
          
          try {
            let result;
            
            if (isPdf) {
              // Upload PDFs as raw files to Cloudinary
              result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                  {
                    folder: 'office-documents',
                    public_id: publicId,
                    resource_type: 'raw',
                    format: 'pdf',
                    timeout: 60000 // <-- add this
                  },
                  (error, result) => {
                    if (error) {
                      console.error('Cloudinary PDF upload error:', error);
                      reject(error);
                    } else {
                      resolve(result);
                    }
                  }
                ).end(file.buffer);
              });
            } else {
              // Upload images as image files to Cloudinary
              result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                  {
                    folder: 'office-documents',
                    public_id: publicId,
                    resource_type: 'image',
                    timeout : 60000 // <-- add this
                  },
                  (error, result) => {
                    if (error) {
                      console.error('Cloudinary image upload error:', error);
                      reject(error);
                    } else {
                      resolve(result);
                    }
                  }
                ).end(file.buffer);
              });
            }

            processedFiles.push({
              ...file,
              path: result.secure_url,
              filename: result.public_id
            });

          } catch (cloudinaryError) {
            console.error('Cloudinary upload error for file:', file.originalname, cloudinaryError);
            throw new Error(`Failed to upload file: ${file.originalname}`);
          }
        }

        req.files = processedFiles;
        next();
        
      } catch (error) {
        console.error('File processing error:', error);
        next(error);
      }
    });
  };
};

const upload = createUpload();

module.exports = { upload, cloudinary };