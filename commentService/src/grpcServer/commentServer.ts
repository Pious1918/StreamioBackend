import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import commentModel from '../models/commentModel';
const PROTO_PATH = './proto/comment.proto';


var packageDefinition = protoLoader.loadSync(PROTO_PATH, {})
const commentPackage = grpc.loadPackageDefinition(packageDefinition);
const commentProto: any = commentPackage.CommentService

console.log("comment proto is ", commentProto)
const comments: any = {}



async function GetComments(call: any, callback: any) {
  const { videoId } = call.request;

  try {

    const comments = await commentModel.find({ videoId });

    // Map over the comments to include replies as well
    const commentData = comments.map((comment: any) => ({
      id: comment._id.toString(),
      username: comment.username,
      content: comment.comment,
      replies: comment.replyComments.map((reply: any) => ({
        userId: reply.userId,
        username: reply.username,
        content: reply.comment,
        createdAt: reply.createdAt,
      })),
    }));

    // Return the comments via gRPC callback
    callback(null, {
      status: 'success',
      comments: commentData,
    });
  } catch (error) {

    callback({
      code: grpc.status.INTERNAL,
      message: 'Failed to fetch comments',
      details: "message",
    });
  }
}



async function PostComment(call: any, callback: any) {
  const { userId, videoId, content, replyToCommentId, username } = call.request;

  if (replyToCommentId) {

    try {
      // Find the original comment to add the reply to
      const comment = await commentModel.findById(replyToCommentId);

      if (!comment) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: 'Comment not found',
          details: 'Message',
        });
        return;
      }

      const newReply = {
        userId,
        username,
        comment: content,
        createdAt: new Date(),
      };

      if (!comment.replyComments) {
        comment.replyComments = [];
      }

      comment.replyComments.push(newReply);

      await comment.save();

      callback(null, {
        status: 'success',
        message: 'Reply posted successfully',
        comment: JSON.stringify(comment),
      });

    } catch (err) {

      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to post reply',
        details: 'Message',
      });

    }

  } else {
    // Handle posting a regular comment
    const newComment = { userId, videoId, content };

    try {
      // Save the comment to the database
      const comment = new commentModel(newComment);
      const savedComment = await comment.save();

      callback(null, {
        status: 'success',
        message: 'Comment posted successfully',
        comment: JSON.stringify(savedComment),
      });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to post comment',
        details: 'Message',
      });
    }
  }
}


export function createGRPCServer() {

  const server = new grpc.Server();
  if (commentProto && commentProto.service) {

    server.addService(commentProto.service, { PostComment, GetComments })

  } else {
    console.error("failed to add service: Ivalid commentProto")
  }

  return server

}


