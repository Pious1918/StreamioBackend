import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';


const PROTO_PATH = path.resolve(__dirname, '../proto/video.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const videoPackage = grpc.loadPackageDefinition(packageDefinition)
const videoProto:any = videoPackage.VideoService

const client = new videoProto(
    "video-service:50052",
    grpc.credentials.createInsecure()
)

export {client}