// controllers/uploadController.js
import { cloudinary } from '../config/cloudinary.js';

// Handle file uploads to Cloudinary
export const uploadFile = async (req, res) => {
  try {
    // Check if file exists (Cloudinary middleware already processed it)
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return the Cloudinary URL
    return res.status(200).json({ 
      url: req.file.path,
      message: 'File uploaded successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error uploading file', 
      error: error.message 
    });
  }
};