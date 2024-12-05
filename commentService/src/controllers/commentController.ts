import { Request, Response } from 'express'
import IAuthRequest from '../interfaces/requestInterfaces';
import { CommentService } from '../services/commentService';




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


    public replyComment = async (req: IAuthRequest, res: Response) => {
        try {

            const userId = req.user?.userId
            console.log(req.body)
            const commentId = req.body.cId
            const reply = req.body.reply
            if (!userId) {
                res.status(400).send("User is not authenticated");
                return
            }

            console.log("userId commentId reply", userId, commentId, reply)
            const replyData = await this._commentService.addReply(userId, commentId, reply)
            res.status(200).json({
                message: "Reply added successfully",
                reply: replyData // Assuming `replyData` is returned from the service
            });
        } catch (error) {
            console.error("Error in replyComment:", error);
             res.status(500).send("Internal server error");
        }
    }


}