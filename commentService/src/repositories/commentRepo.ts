import commentModel, { ICommentDocument } from "../models/commentModel";
import { BaseRepository } from "./baseRepo";

export interface IReplyComment {
    userId: string;
    username: string;
    comment: string;
    createdAt: Date;
}


export class CommentRepository extends BaseRepository<ICommentDocument> {

    constructor() {
        super(commentModel)
    }


    async postComment(commentData: Partial<ICommentDocument>): Promise<ICommentDocument> {

        if (!commentData.userId || !commentData.videoId || !commentData.username || !commentData.comment) {
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

            const updatedComment = await commentModel.findByIdAndUpdate(
                commentId,
                {
                    $push: { replyComments: replyData },
                },
                { new: true }
            );

            return updatedComment;

        } catch (error) {

            console.error("Error updating comment with reply:", error);
            throw new Error("Unable to update comment with reply");

        }
    }



}