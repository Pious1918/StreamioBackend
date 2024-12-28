
import mongoose , {Document , Schema} from "mongoose";

export interface IuserDocument extends Document {
    _id: string,
    name: string;
    email: string;
    password: string;
    phonenumber: string;
    country: string;
    profilepicture: string;
    status: string;
    role: string;
    subscribers?: string[];
    following?: string[];
    createdAt?: Date; 

}




const userSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phonenumber: { type: String, required: true },
    country: { type: String, required: true },
    profilepicture: { type: String, default: 'noImage' },
    role: { type: String, default: 'user' },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now } , 

    subscribers: [{
        type: mongoose.Types.ObjectId,
        ref: 'StreamioUser'
    }],
    following: [{
        type: mongoose.Types.ObjectId,
        ref: 'StreamioUser'
    }]
}, {
    timestamps: true 
});

const userModel = mongoose.model<IuserDocument>('StreamioUser' , userSchema)

export default userModel;
