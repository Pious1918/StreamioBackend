import { Schema ,model} from "mongoose";
import {  IreportVDocument } from "../interfaces/IlikedVideoDocument.interface";


const reportSchema:Schema = new Schema({
    videoId: { type: String, required: true },
    reason: { type: String, required: true },
    reportedAt: { type: Date, default: Date.now },
  });


  const reportModel = model<IreportVDocument>('reportVideos',reportSchema)

  export default reportModel