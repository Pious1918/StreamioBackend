import { Schema ,model} from "mongoose";
import {  InoticeDocument } from "../interfaces/IlikedVideoDocument.interface";


const noticeSchema: Schema = new Schema({
  videoId: { type: String, required: true, unique: true }, 
  notice: { type: String, required: true}, 

});


  const noticeModel = model<InoticeDocument>('reportNotice',noticeSchema)

  export default noticeModel