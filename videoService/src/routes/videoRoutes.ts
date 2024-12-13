import { Request, Response } from "express";

import { Router } from "express";
import { VideoController } from "../controllers/videoController";
import { AuthMiddleware } from "../middleware/authmiddle";
import express from "express"
import path from "path";
import VideoModel from "../models/videoModel";

// import express from "express";

const router = Router()
const authMiddleware = new AuthMiddleware(); // Create an instance of your AuthMiddleware

const videoController = new VideoController()


router.get('/videos', videoController.getVideos)
router.get('/likedvideos', authMiddleware.authorize, videoController.likedVideos)
router.get('/getprivatevideos', authMiddleware.authorize, videoController.getPrivatevideos)
router.get('/getwatchlatervideos', authMiddleware.authorize, videoController.getwatchlatervideos)
router.get('/getreportvideos', authMiddleware.authorize, videoController.getReportedvideos)
router.get('/reportvideosAdmin', videoController.getReportedVAdmin)
router.get('/video/:videoId' , authMiddleware.authorize ,videoController.getVideo)
router.get('/reportreason/:videoId' , authMiddleware.authorize ,videoController.getReportReason)
router.get('/fetchOther/:videoId' ,videoController.fetchOthers)
router.get('/video/:videoId/hls',videoController.getHlsVideo)
router.get('/topfive',videoController.topfive)
router.get('/getuseruploadedvideo',authMiddleware.authorize,videoController.getUseruploadedvideo)


router.put('/update-video/:id',  videoController.updatevideodata)

router.get('/hls', express.static(path.resolve(__dirname, '../../hls')), (req, res, next) => {
    console.log('Serving:', req.path);
    next();
  });
router.post('/generate-video-presigned-url',  videoController.genPresignedurl)
router.post('/save-video-data',authMiddleware.authorize,  videoController.videoDataSave)
router.post('/reportvideo',authMiddleware.authorize,  videoController.saveReportVideoData)
router.post('/verifybyadmin',  videoController.verifybyadmin)
router.post('/verifybyuser',  videoController.verifybyuser)
router.post('/noticebyadmin',  videoController.noticebyadmin)
router.put('/updateviews',authMiddleware.authorize,  videoController.videoViews)
router.post('/savewatchlater',authMiddleware.authorize,  videoController.savewatchlater)

router.post('/convert', authMiddleware.authorize , videoController.convertToHLS)
router.post('/comments', authMiddleware.authorize , videoController.postcomment)
router.post('/likevideo', authMiddleware.authorize , videoController.likeVideo)
router.post('/unlike', authMiddleware.authorize , videoController.unlikeVideo)




export default router