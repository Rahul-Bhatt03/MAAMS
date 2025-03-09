import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Username validation regex (only letters, numbers, underscores, and min 3 characters)
const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;

// Phone number validation regex (10-digit numbers)
const phoneRegex = /^[0-9]{10}$/;

export const registerUser = async (req, res) => {
  try {
    const { name, username, phoneNumber, dob, email, password, role } =
      req.body;

      if(!emailRegex)return res.status(400).json({message:'invalid email format'})

        if(!usernameRegex)return res.status(400).json({message:"invallid username"})
      if(!phoneRegex) return res.status(400).json({message:"invaid phone number "})

    const userExist = await User.findOne({ $or :[{email},{username},{phoneNumber}] });
    if (userExist){
      let message=""
      if(userExist.email===email)message="Email already exists!"
      else if(userExist.username===username)message="username already exists!"
      else if(userExist.phoneNumber===phoneNumber)message='phoneNumber already registered'
      return res.status(400).json({error:message})
    }



    //role based registration: if no role is given then public will be assigned
    let userRole = "public";
    if (role && ["admin", "superAdmin"].includes(role)) {
      userRole = role;
    }
    const newUser = new User({
      name,
      username,
      phoneNumber,
      dob,
      email,
      password,
      role: userRole,
      isActive: true, // Explicitly setting isActive to true
    });
    await newUser.save();
    res.status(201).json({ message: "user registration succeded" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign(
        {
          id: user._id,
          role:user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: token,
        role:user.role
      });
    } else {
      res.status(401).json({ message: "invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    // Extract userId from the request body (or query string if you prefer)
    const { userId } = req.body; // or req.query.userId if using query params

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Fetch the user based on the provided userId
    const user = await User.findById(userId)
      .select('-password') // Exclude password from the result
      .populate('departments') // Populate related departments
      .lean(); // Converts to plain JS object

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Send the user profile back in the response
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user profile',
      error: error.message,
    });
  }
};
