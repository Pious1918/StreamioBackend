import { Request, Response } from 'express'
import IAuthRequest from '../interfaces/requestInterfaces';
import { CommentService } from '../services/commentService';
import { StatusCodes } from '../enums/statusCode.enums';




export class CommentController {

    private _commentService: CommentService

    constructor() {
        this._commentService = new CommentService()
    }


    public postComment = async (req: IAuthRequest, res: Response) => {
        try {

            const { comment, videoId } = req.body;
            const userId = req.user?.userId
            const userName = req.user?.name

            if (!userId) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: "User ID is required" });
                return;
            }

            if (!userName) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: "User name is required" });
                return;
            }

            const commntdata = await this._commentService.postComment(userId, videoId, userName, comment)
            res.status(StatusCodes.OK).json({
                status: 'success',
                message: 'Comment posted successfully',
                commntdata,
            });

        } catch (error) {

            console.error("Error posting comment:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to post comment', details: "message" });

        }
    }



    public getComments = async (req: Request, res: Response) => {

        try {
            const { videoId } = req.params;
            const comments = await this._commentService.getComments(videoId);
            res.status(StatusCodes.OK).json({ comments });

        } catch (error) {

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to retrieve comments', details: "error.message" });

        }
    }


    public replyComment = async (req: IAuthRequest, res: Response) => {
        try {

            const userId = req.user?.userId
            const userName = req.user?.name
            const commentId = req.body.cId
            const reply = req.body.reply

            if (!userId) {
                res.status(StatusCodes.BAD_REQUEST).send("User is not authenticated");
                return
            }

            if (!userName) {
                res.status(StatusCodes.BAD_REQUEST).send("User name not authenticated");
                return
            }

            const replyData = await this._commentService.addReply(userId, userName, commentId, reply)
            res.status(StatusCodes.OK).json({
                message: "Reply added successfully",
                reply: replyData
            });

        } catch (error) {

            console.error("Error in replyComment:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");

        }
    }


}