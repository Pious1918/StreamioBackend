import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import VideoModel from '../models/videoModel';
import { IvideoDocument } from '../interfaces/IvideoDocument.interface';
const PROTO_PATH ='./proto/video.proto';


const packageDefinition = protoLoader.loadSync(PROTO_PATH , {})
const videoPackage = grpc.loadPackageDefinition(packageDefinition)
const videoProto:any = videoPackage.VideoService


async function GetVideosByUploader(call: any, callback: any) {
    try {
        const uploaderId = call.request.uploaderId;
        const videos = await VideoModel.find({ uploaderId }); 
        
        const response = {
            videos: videos.map(video => ({
                uploaderId: video.uploaderId,
                title: video.title,
                description: video.description,
                likes: video.likes,
                views: video.views,
                videolink: video.videolink,
                visibility: video.visibility,
                price: video.price,
                paid: video.paid,
                _id: video._id
            })),
        };

        callback(null, response); // Successfully return response
    } catch (error) {
        console.error("Error fetching videos: ", error);
        callback({
            code: grpc.status.INTERNAL,
            message: 'Error fetching videos',
        });
    }
}




export function createGRPCServer(){
    const server = new grpc.Server()

    if(videoProto && videoProto.service){
        server.addService(videoProto.service, {GetVideosByUploader})
    }
    else{
        console.error("failed to add service: Ivalid commentProto")
    }

    return server

}