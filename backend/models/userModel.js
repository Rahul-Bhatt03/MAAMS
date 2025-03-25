import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: [true, "phoneNumber is required"],
    unique: true,
  },
  profileImage:[{type:String}],
  dob: {
    type: Date,
    required: [true, "dob is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    trim: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
  },
  role: {
    type: String,
    enum: [
      "public",
      "admin",
      "superAdmin",
      "groupAdmin",
      "doctor",
      "nurse",
      "pharmist",
    ],
    default: "public",
  },
  signupMethod: {
    type: String,
    enum: ["direct", "google", "facebook"],
    default: "direct",
  },
  isActive: {
    type: Boolean,
    default: true, //soft deletion flag
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deviceToken:String,  //for push notification
});

//hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//compare entered pass with the hashed pass
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
