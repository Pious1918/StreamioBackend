import { Schema ,model} from "mongoose";
import { Visibility } from "../enums/visibility.enum";
import { PaidStatus } from "../enums/paidStatus.enum";
import { IvideoDocument } from "../interfaces/IvideoDocument.interface";



// Create the video schema
const videoSchema: Schema = new Schema({
    uploaderId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    videolink: { type: String, required: true },
    thumbnail: { type: String, required: true },
    category: { type: String, required: true },
    visibility: { 
        type: String, 
        default: Visibility.PUBLIC, // Set default to public
        required: true 
    },
    price: { type: Number, default: 0}, // Assuming price is required
    paid: { 
        type: String, 
        default: PaidStatus.UNPAID, // Set default to unpaid
        required: true 
    },
    createdAt: { type: Date, default: Date.now } , // Ensure createdAt field is here

});
const VideoModel = model<IvideoDocument>('Video', videoSchema);
export default VideoModel;