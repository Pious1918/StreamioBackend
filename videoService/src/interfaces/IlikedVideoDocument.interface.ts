import { Document } from "mongoose";

export interface IlikedVDocument extends Document{
    _id:string,
    videoId:string,
    userId:string,
    createdAt?:Date
}