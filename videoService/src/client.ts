import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// // const PROTO_PATH = path.resolve(__dirname, '../../commentService/src/comment.proto');
const PROTO_PATH = path.resolve(__dirname, '../../commentService/proto/comment.proto');
const USER_PROTO_PATH = path.resolve(__dirname, '../../userService/proto/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const commentPackage = grpc.loadPackageDefinition(packageDefinition)
const commentProto:any = commentPackage.CommentService

const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH , {})
const userPackage = grpc.loadPackageDefinition(userPackageDefinition)
const userProto: any = userPackage.UserService

const client = new commentProto(
    "localhost:50051",
    grpc.credentials.createInsecure()
)

const client2 = new userProto(
    "localhost:50054",
    grpc.credentials.createInsecure()
)


export {client , client2}