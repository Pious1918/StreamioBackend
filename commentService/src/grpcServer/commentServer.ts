import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import commentModel from '../models/commentModel';
const PROTO_PATH ='./proto/comment.proto';


var packageDefinition = protoLoader.loadSync(PROTO_PATH ,{})
const commentPackage = grpc.loadPackageDefinition(packageDefinition);
const commentProto:any = commentPackage.CommentService

console.log("comment proto is ",commentProto)
const comments:any = {}

// function PostComment(call :any, callback:any){
//     const {userId , videoId , content}=call.request

//     if(!comments[videoId]){
//         comments[videoId]=[]
//     }

//     const newComment = {userId, videoId, content}
//     comments[videoId].push(newComment);

//     callback(null , {
//         status:'success',
//         message:'comment posted successfully',
//         comment:JSON.stringify(newComment)
//     })
// }


async function GetComments(call: any, callback: any) {
    const { videoId } = call.request;

    try {
        // Fetch comments from MongoDB
        const comments = await commentModel.find({ videoId });

          // Extract the content or a relevant field from the comment documents to form the array
        //   const commentContents = comments.map((comment: any) => comment.comment); // Assuming `content` is the field you want

        // const commentData = comments.map((comment: any) => ({
        //     id: comment._id.toString(), // Convert MongoDB ObjectId to string
        //     content: comment.comment, // Assuming `comment` is the content field
        // }));

    // Map over the comments to include replies as well
    const commentData = comments.map((comment: any) => ({
        id: comment._id.toString(),
        content: comment.comment,
        replies: comment.replyComments.map((reply: any) => ({
          userId: reply.userId,
          content: reply.comment,
          createdAt: reply.createdAt,
        })),
      }));

console.log("commentdata @grpc server",commentData)
// Correctly log replies for each comment
// commentData.forEach((comment: any) => {
//     console.log(`Replies for comment ID ${comment.id}:`, comment.replies);
//   });
        // Return the comments via gRPC callback
        callback(null, {
            status: 'success',
            comments: commentData, // You can format the data as needed
        });
    } catch (error) {
        // Handle any errors that occur during the database query
        callback({
            code: grpc.status.INTERNAL,
            message: 'Failed to fetch comments',
            details: "message",
        });
    }
}



// async function PostComment(call: any, callback: any) {
//     const { userId, videoId, content } = call.request;
//     const newComment = { userId, videoId, content };

//     try {
//         // Save the comment to the database
//         const comment = new commentModel(newComment);
//         const savedComment = await comment.save(); // This returns the saved document

//         callback(null, {
//             status: 'success',
//             message: 'Comment posted successfully',
//             comment: JSON.stringify(savedComment),
//         });
//     } catch (err) {
//         callback({
//             code: grpc.status.INTERNAL,
//             message: 'Failed to post comment',
//             details: 'Message',
//         });
//     }
// }


async function PostComment(call: any, callback: any) {
    const { userId, videoId, content, replyToCommentId } = call.request; // replyToCommentId is optional for replies
  
    if (replyToCommentId) {
      // Handle the case where this is a reply to an existing comment
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
  
        // Create the reply
        const newReply = {
          userId,
          comment: content,
          createdAt: new Date(),
        };
  
        // Ensure replyComments is initialized as an empty array if it is undefined
        if (!comment.replyComments) {
          comment.replyComments = [];
        }
  
        // Add the reply to the comment
        comment.replyComments.push(newReply);
  
        // Save the updated comment with the new reply
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


export function createGRPCServer(){

    const server = new grpc.Server();
    if(commentProto && commentProto.service){
        server.addService(commentProto.service, {PostComment ,GetComments})


    }else{
        console.error("failed to add service: Ivalid commentProto")
    }

    return server


}


