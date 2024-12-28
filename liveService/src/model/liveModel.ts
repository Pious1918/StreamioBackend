import mongoose , {Document ,Schema} from 'mongoose'

export interface IliveDocument extends Document{
    roomId:string,
    title:string,
    description:string,
    imageurl:string,
    streamerId:string,
    createdAt?:Date
}

const liveSchema:Schema = new Schema({

    roomId:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    imageurl:{
        type:String,
        required:true
    },
    streamerId:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

const liveModel = mongoose.model<IliveDocument>('StreamioLive',liveSchema)

export default liveModel