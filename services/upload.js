const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// ===========================
// CLOUDINARY CONFIGURATION
// ===========================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ===========================
// MULTER MEMORY STORAGE
// ===========================
const storage = multer.memoryStorage();

// ===========================
// FILE FILTER
// ===========================
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images allowed.'), false);
    }
};

// ===========================
// MULTER CONFIGURATION
// ===========================
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// ===========================
// CLOUDINARY UPLOAD HELPER
// ===========================
const uploadToCloudinary = (fileBuffer, filename) => {
    return new Promise((resolve, reject) => {
        // Remove extension
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        
        // Sanitize: only alphanumeric, hyphens, underscores
        const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, "_");
        
        // Add timestamp for uniqueness
        const uniqueName = `${Date.now()}_${safeName}`;

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'blogify_uploads',
                public_id: uniqueName,
                format: 'webp',
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

module.exports = { upload, uploadToCloudinary, cloudinary };
