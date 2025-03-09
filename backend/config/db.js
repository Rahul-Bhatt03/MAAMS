import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config()
const connectDB=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URL
        );
        console.log("mongodb connected successfully")
    }catch(error){
        console.error(`error:${error.message}`)
        process.exit(1);
    }
}

export default connectDB