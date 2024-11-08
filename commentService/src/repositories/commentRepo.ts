import commentModel, { ICommentDocument } from "../models/commentModel";
import { BaseRepository } from "./baseRepo";


export class CommentRepository extends BaseRepository<ICommentDocument> {

    constructor() {
        super(commentModel)
    }


    async postComment(commentData: Partial<ICommentDocument>): Promise<ICommentDocument> {
        console.log("reached@COmment repo")
       
        if (!commentData.userId || !commentData.videoId || !commentData.comment) {
            throw new Error('Missing required fields');
        }
        const savecomment = await this.save(commentData)

        if (!savecomment) {
            throw new Error("Failed to save comment")
        }

        return savecomment
    }
}