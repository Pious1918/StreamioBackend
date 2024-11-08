import { Request, Response } from 'express'

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import IAuthRequest from '../interfaces/requestInterfaces';
import { CommentService } from '../services/commentService';

const PROTO_PATH = __dirname + '/../comment.proto';
const packageDef = protoLoader.loadSync(PROTO_PATH, {})
const commentProto = (grpc.loadPackageDefinition(packageDef) as any)
console.log("comementporot", commentProto)



export class CommentController {



    private _commentService: CommentService

    constructor() {
        this._commentService = new CommentService()
    }


    ///HTTP method for posting a comment
    public postComment = async (req: IAuthRequest, res: Response) => {
        try {
            const { comment, videoId } = req.body;
            const userId = req.user?.userId
            console.log("coommetn", comment)
            console.log("coommetn", videoId)
            console.log("userid", userId)
            if (!userId) {
                res.status(400).json({ error: "User ID is required" });
                return;
            }
            const commntdata = await this._commentService.postComment(userId, videoId, comment)
            console.log("commentdata", commntdata)
            res.status(200).json({
                status: 'success',
                message: 'Comment posted successfully',
                commntdata,
            });
        } catch (error) {
            console.error("Error posting comment:", error);

            res.status(500).json({ error: 'Failed to post comment', details: "message" });

        }
    }

    // HTTP method for getting comments
    public getComments = async (req: Request, res: Response) => {
        try {
            const { videoId } = req.params;
            const comments = await this._commentService.getComments(videoId);
            res.status(200).json({ comments });
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve comments', details: "error.message" });
        }
    }


    // gRPC server method for getting comments
    // private async getCommentsGRPC(call: any, callback: any): Promise<void> {
    //     try {
    //         const { videoId } = call.request;
    //         const comments = await this._commentService.getComments(videoId);
    //         callback(null, { comments });
    //     } catch (error) {
    //         callback(error);
    //     }
    // }
    // private async postCommentGRPC(call: any, callback: any): Promise<void> {
    //     try {
    //       const { userId, videoId, content } = call.request;
    //       const comment = await this._commentService.postComment(userId, videoId, content);
    //       callback(null, { status: 'success', message: 'Comment posted successfully', comment });
    //     } catch (error) {
    //       callback(error);
    //     }
    //   }





    // // Method to start the gRPC server
    // public startGRPCServer(): void {
    //     const server = new grpc.Server();
    //     server.addService(commentProto.CommentService.service, {
    //         PostComment: this.postCommentGRPC.bind(this),
    //         GetComments: this.getCommentsGRPC.bind(this),
    //     });

    //     server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), (error, port) => {
    //         if (error) {
    //             console.error('Failed to start gRPC server:', error);
    //         } else {
    //             console.log(`gRPC Server running on port ${port}`);
    //             server.start();
    //         }
    //     });
    // }


}