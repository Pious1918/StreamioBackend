import { Router } from "express";
import { VideoController } from "../controllers/videoController";
import { AuthMiddleware } from "../middleware/authmiddle";
import express from "express"
import path from "path";

// import express from "express";

const router = Router()
const authMiddleware = new AuthMiddleware(); // Create an instance of your AuthMiddleware

const videoController = new VideoController()


router.get('/videos', videoController.getVideos)
router.get('/video/:videoId' ,videoController.getVideo)
router.get('/video/:videoId/hls',videoController.getHlsVideo)

router.get('/getuseruploadedvideo',authMiddleware.authorize,videoController.getUseruploadedvideo)

router.get('/hls', express.static(path.resolve(__dirname, '../../hls')), (req, res, next) => {
    console.log('Serving:', req.path);
    next();
  });
router.post('/generate-video-presigned-url',  videoController.genPresignedurl)
router.post('/save-video-data',authMiddleware.authorize,  videoController.videoDataSave)






export default router