
import mongoose, { Document, Schema } from "mongoose";
export interface IFollowingDocument extends Document{

    userId:mongoose.Types.ObjectId;
    followingUserId:mongoose.Types.ObjectId;
    createdAt:Date
}


const followingSchema:Schema = new Schema({

    userId:{
        type:mongoose.Types.ObjectId,
        ref:'StreamioUser',
        required:true
    },
    followingUserId:{
        type:mongoose.Types.ObjectId,
        ref:'StreamioUser',
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const FollowingModel = mongoose.model<IFollowingDocument>('Following', followingSchema);
export default FollowingModel;