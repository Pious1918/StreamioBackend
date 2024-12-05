import { Document } from "mongoose";
import { Visibility } from "../enums/visibility.enum";
import { PaidStatus } from "../enums/paidStatus.enum";

export interface IvideoDocument extends Document{
    _id:string,
    uploaderId:string,
    title:string,
    description:string,
    likes:number,
    views:number,
    videolink:string,
    category:string,
    thumbnail?:string,
    visibility: Visibility; // Updated to use the enum
    price:number,
    paid: PaidStatus; // Updated to use the enum
    createdAt?:Date
}