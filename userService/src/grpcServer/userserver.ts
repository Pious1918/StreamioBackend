import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import userModel from '../models/userModel';

const PROTO_PATH = './proto/user.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {})
const userPackage = grpc.loadPackageDefinition(packageDefinition)
const userProto: any = userPackage.UserService

console.log("user proto is", userProto)

async function GetChannelDetails(call: any, callback: any) {

    try {
        const uploaderId = call.request._id;
        console.log("uploader id", uploaderId)
        const channelDetails = await userModel.findOne({ _id: uploaderId });

        console.log("channel details are ", channelDetails)

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
    } catch (error) {
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
        console.log("uploader id", userId)
        const viewerDetails = await userModel.findOne({ _id: userId });

        console.log("user details are ", viewerDetails)

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
