import { Schema ,model} from "mongoose";
import { IlikedVDocument } from "../interfaces/IlikedVideoDocument.interface";


const watchlaterSchema:Schema = new Schema({
    videoId:{type:String , required:true},
    userId:{type:String , required:true},
    createdAt:{type:Date , default:Date.now}
})


const watchlaterModel = model<IlikedVDocument>('watchlater', watchlaterSchema)

export default watchlaterModel