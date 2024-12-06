import commentModel, { ICommentDocument } from "../models/commentModel";
import { BaseRepository } from "./baseRepo";

export interface IReplyComment {
    userId: string;  
    username:string;      // The ID of the user who posted the reply
    comment: string;       // The text content of the reply
    createdAt: Date;       // The timestamp of when the reply was created
}


export class CommentRepository extends BaseRepository<ICommentDocument> {

    constructor() {
        super(commentModel)
    }


    async postComment(commentData: Partial<ICommentDocument>): Promise<ICommentDocument> {
        console.log("reached@COmment repo")
       
        if (!commentData.userId || !commentData.videoId || !commentData.username || !commentData.comment  ) {
            throw new Error('Missing required fields');
        }
        const savecomment = await this.save(commentData)

        if (!savecomment) {
            throw new Error("Failed to save comment")
        }

        return savecomment
    }


    async updateReply(commentId: string, replyData: IReplyComment) {
        try {
            // Use `findByIdAndUpdate` to find the comment by its ID and add the reply
            const updatedComment = await commentModel.findByIdAndUpdate(
                commentId,
                {
                    $push: { replyComments: replyData }, // Push the reply to the array
                },
                { new: true } // Return the updated document
            );
    
            return updatedComment;
        } catch (error) {
            console.error("Error updating comment with reply:", error);
            throw new Error("Unable to update comment with reply");
        }
    }
    


}