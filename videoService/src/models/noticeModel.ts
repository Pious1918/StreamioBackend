import { Schema ,model} from "mongoose";
import {  InoticeDocument } from "../interfaces/IlikedVideoDocument.interface";


const noticeSchema: Schema = new Schema({
  videoId: { type: String, required: true, unique: true }, // Ensure videoId is unique
  notice: { type: String, required: true}, // Ensure videoId is unique

});


  const noticeModel = model<InoticeDocument>('reportNotice',noticeSchema)

  export default noticeModel