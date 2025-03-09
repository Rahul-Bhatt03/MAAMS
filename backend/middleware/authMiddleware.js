import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();
 const protect = async (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the header
      token = req.headers.authorization.split(' ')[1]; // Fix: Use split(' ')[1]

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user and attach it to the request object
      req.user = await User.findById(decoded.id).select('-password');

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      // Handle token verification errors
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // Handle missing token
    res.status(401).json({ message: 'Not authorized, token is missing' });
  }
};

export default protect