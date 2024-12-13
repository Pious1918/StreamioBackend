import { Document } from "mongoose";

export interface IlikedVDocument extends Document {
    _id: string,
    videoId: string,
    userId: string,
    createdAt?: Date
}
export interface IreportVDocument extends Document {
    _id: string,
    videoId: string,
    reason: string,
    reportedAt?: Date
}
export interface InoticeDocument extends Document {
    _id: string,
    videoId: string,
    notice:string
}