import { NextFunction, Request, Response, Router } from "express";
import express from "express";
import { Middleware } from "../middlewares/authMiddleware";
import { UserController } from "../controllers/userController";
import userModel from "../models/userModel";
import FollowingModel from "../models/followingModel";
import SubscriberModel from "../models/subscribersModel";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import upload, { uploadToS3 } from "../utils/uploader";
import { refreshTokenHandler } from "../utils/refreshTokenhandler";
import { AdminController } from "../controllers/adminController";

const userController = new UserController()
const adminController = new AdminController()
const middleWare = new Middleware()

const router = Router()

//user Routes
router.post('/register', userController.registerUser)
router.get('/check-email', userController.checkEmail)
router.post('/login', userController.loginuser)
router.post('/generateotp', userController.generateotp)  
router.post('/submitotp', userController.submitotp)
router.post('/resetpassword', userController.resetpassword)
router.get('/userprofile', middleWare.authorize, userController.getUserProfile)
router.get('/subscribersList', middleWare.authorize, userController.getSubscriberlist)
router.get('/followingList', middleWare.authorize, userController.getfollowinglist)
router.get('/getbanneruser',middleWare.authorize, userController.getBanneruser)
router.get('/videos',middleWare.authorize, userController.getUploadedvideos)
router.get('/users', middleWare.authorize, userController.searchuser)
router.get('/countuser', userController.userCount)
router.post('/update', middleWare.authorize, userController.updateUserData)
router.post('/uploadProfilePicture', middleWare.authorize,userController.updateProfilePic)
router.post('/generate-presigned-url', middleWare.authorize, userController.genPresignedurl)
router.post('/generateCommonPresigner', adminController.gencommonPresignedurl)
router.post('/deletefroms3', userController.deletefroms3)
router.post('/deletebanner', adminController.deletebanner)


router.post('/adminlogin', userController.adminLogin)
router.get('/userlist', userController.loadAdminDashboard)
router.post('/savebanner', adminController.saveBanner)
router.get('/getbanner', adminController.getBanner)

router.put('/userds/:id/status', userController.updateUserStatus)
router.post('/subscribeee' , middleWare.authorize , userController.subscribeuser)
router.post('/unsubscribe' , middleWare.authorize , userController.unsubscribeuser)












router.post('/refresh-token', (req: Request, res: Response, next: NextFunction) => {
    refreshTokenHandler(req, res, next).catch(next); 
});




export default router