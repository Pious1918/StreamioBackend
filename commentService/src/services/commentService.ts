import { CommentRepository } from "../repositories/commentRepo"



export class CommentService {

  private _commentrepository: CommentRepository

  constructor() {
    this._commentrepository = new CommentRepository()
  }


  public async postComment(userId: string, videoId: string, userName:string, content: string): Promise<any> {

    const data = { userId, videoId, username:userName , comment: content };
    const commentdata = await this._commentrepository.postComment(data)
    return commentdata; 

  }


  public async getComments(videoId: string): Promise<any> {
    // return CommentModel.find({ videoId }).sort({ timestamp: -1 }).exec();
  }



  public async addReply(userId: string, username:string, commentId: string, reply: string) {

    const replyData = {
      userId,
      username:username,
      comment: reply,
      createdAt: new Date()
    };

    try {

      const updatedComment = await this._commentrepository.updateReply(commentId, replyData);
      return updatedComment;

    } catch (error) {

      console.error("Error in addReply:", error);
      throw new Error("Unable to add reply to comment");
      
    }
  }


}