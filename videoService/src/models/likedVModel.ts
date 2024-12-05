import { Schema ,model} from "mongoose";
import { IlikedVDocument } from "../interfaces/IlikedVideoDocument.interface";


const likedSchema:Schema = new Schema({
    videoId:{type:String , required:true},
    userId:{type:String , required:true},
    createdAt:{type:Date , default:Date.now}
})


const likedModel = model<IlikedVDocument>('likedv', likedSchema)

export default likedModel