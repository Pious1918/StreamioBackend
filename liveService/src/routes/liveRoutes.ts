import { Router } from "express";
import express from 'express'
import { liveController } from "../controllers/liveController";
import { AuthMiddleware } from "../middlewares/authMiddleware";

const router = Router()


const livecontroller = new liveController()
const middleWare = new AuthMiddleware()


router.post('/livestart' , )
router.post('/generate-presigned-url', middleWare.authorize, livecontroller.genPresignedurl)

router.post('/saveStreamdata', middleWare.authorize, livecontroller.saveLiveData)
router.delete('/deleteStreamdata/:roomid', middleWare.authorize, livecontroller.deleteLivedata)
router.get('/getalllives', middleWare.authorize, livecontroller.getOngoinglives)

export default router
