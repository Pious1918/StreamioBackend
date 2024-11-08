import { model, Schema ,Document} from "mongoose"

export interface ICommentDocument extends Document{

    _id:string,
    userId:string,
    videoId:string,
    comment:string
    createdAt?: Date;
    updatedAt?: Date;
}


const commentSchema:Schema = new Schema({
    videoId:{type:String , required:true},
    userId:{type:String, required:true},
    comment:{type:String, required:true}
},{ timestamps: true })

const commentModel = model<ICommentDocument>('comment',commentSchema)

export default commentModel