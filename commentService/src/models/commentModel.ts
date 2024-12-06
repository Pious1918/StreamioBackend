import { model, Schema ,Document} from "mongoose"

export interface ICommentDocument extends Document{

    _id:string,
    userId:string,
    videoId:string,
    comment:string
    username:string,
    createdAt?: Date;
    updatedAt?: Date;
    replyComments?: IReplyComment[]; // New field for replies

}
export interface IReplyComment {
    userId: string;
    username:string
    comment: string;
    createdAt: Date; // Timestamp for when the reply was created
}

const replyCommentSchema = new Schema<IReplyComment>({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const commentSchema:Schema = new Schema({
    videoId:{type:String , required:true},
    userId:{type:String, required:true},
    comment:{type:String, required:true},
    username:{type:String, required:true},
    replyComments: { type: [replyCommentSchema], default: [] } // Array of replies

},{ timestamps: true })

const commentModel = model<ICommentDocument>('comment',commentSchema)

export default commentModel