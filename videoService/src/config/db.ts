
import mongoose from "mongoose";

import dotenv from 'dotenv'

dotenv.config()

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL as string , {})
        console.log("mongodb connected @videoService")
    } catch (error) {
        console.log("Mongo db connection in videoservice failed",error)
    }
}


export default connectDB