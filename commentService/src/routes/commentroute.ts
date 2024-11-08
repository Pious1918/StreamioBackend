import { Router } from "express";

import express from 'express'
import { CommentController } from "../controllers/commentController";
import { AuthMiddleware } from "../middleware/authmiddleware";
const router = Router()
const authMiddleware = new AuthMiddleware(); // Create an instance of your AuthMiddleware


const commentController = new CommentController()

router.post('/comments', authMiddleware.authorize, commentController.postComment)
router.get('/comments/:videoId',commentController.getComments);



export default router