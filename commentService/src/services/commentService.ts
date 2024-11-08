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
}