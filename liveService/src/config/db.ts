
import mongoose from "mongoose";

import dotenv from 'dotenv'
dotenv.config()

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL as string , {})
        console.log("mongodb connected")
    } catch (error) {
        console.log("Mongo db connection in userService failed",error)
    }
}

export default connectDB