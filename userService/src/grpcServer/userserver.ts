import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import userModel from '../models/userModel';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const PROTO_PATH = './proto/user.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {})
const userPackage = grpc.loadPackageDefinition(packageDefinition)
const userProto: any = userPackage.UserService

console.log("user proto is", userProto)

async function GetChannelDetails(call: any, callback: any) {

    const metadata = call.metadata.get('authorization');
    if (!metadata || metadata.length === 0) {
      return callback({
        code: grpc.status.UNAUTHENTICATED,
        message: 'Missing authentication token',
      });
    }
  
    const token = metadata[0].split(' ')[1];
  
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment variables.");
      return callback({
        code: grpc.status.INTERNAL,
        message: 'Server misconfiguration: JWT secret is missing.',
      });
    }




    try {

        const uploaderId = call.request._id;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("decoded @ usergrpc",decoded)

        const channelDetails = await userModel.findOne({ _id: uploaderId });

        if (!channelDetails) {
            return callback({
                code: grpc.status.NOT_FOUND,
                message: 'User not found',
            });
        }

        // Respond with the user data
        callback(null, {
            _id: channelDetails._id.toString(),
            name: channelDetails.name,
            email: channelDetails.email,
        });

    } catch (error:any) {


        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            // Handle token verification errors
            return callback({
              code: grpc.status.UNAUTHENTICATED,
              message: 'Invalid or expired token',
            });
          }



        console.error('Error in GetChannelDetails:', error);
        // Handle any unexpected errors
        callback({
            code: grpc.status.INTERNAL,
            message: 'Internal server error',
        });

    }

}



async function GetViewerDetails(call: any, callback: any) {

    try {

        const userId = call.request._id;
        const viewerDetails = await userModel.findOne({ _id: userId });

        if (!viewerDetails) {
            return callback({
                code: grpc.status.NOT_FOUND,
                message: 'User not found',
            });
        }

        // Respond with the user data
        callback(null, {
            _id: viewerDetails._id.toString(),
            name: viewerDetails.name,
            email: viewerDetails.email,
            following:viewerDetails.following
        });

    } catch (error) {
        console.error('Error in GetChannelDetails:', error);

        // Handle any unexpected errors
        callback({
            code: grpc.status.INTERNAL,
            message: 'Internal server error',
        });

    }

}



export function createGRPCServer(){

    const server = new grpc.Server()
    server.addService(userProto.service, {GetChannelDetails , GetViewerDetails})
    return server
}
