import { CommentRepository } from "../repositories/commentRepo"



export class CommentService {

  private _commentrepository: CommentRepository

  constructor() {
    this._commentrepository = new CommentRepository()
  }


  ///Promise<Icomment>
  public async postComment(userId: string, videoId: string, content: string): Promise<any> {


    console.log("@ sreevie")
    const data = { userId, videoId, comment: content };

    console.log("dafdaf", data)

    const commentdata = await this._commentrepository.postComment(data)
    return commentdata; // Return the saved comment data

  }


  // Retrieve comments for a video
  public async getComments(videoId: string): Promise<any> {
    // return CommentModel.find({ videoId }).sort({ timestamp: -1 }).exec();
  }

  public async addReply(userId: string, commentId: string, reply: string) {
    console.log("@service", userId, commentId, reply);

    const replyData = {
      userId,
      comment: reply,
      createdAt: new Date()
    };

    // Call the repository to update the comment with the reply
    try {
      const updatedComment = await this._commentrepository.updateReply(commentId, replyData);
      console.log("Updated comment with reply:", updatedComment);

      // Returning the updated comment with the new reply
      return updatedComment; // This can be returned to the controller for response
    } catch (error) {
      console.error("Error in addReply:", error);
      throw new Error("Unable to add reply to comment");
    }
  }


}