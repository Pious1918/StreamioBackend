import { Router } from "express";
import express from "express";

import { Middleware } from "../middlewares/authMiddleware";
import { UserController } from "../controllers/userController";
import userModel from "../models/userModel";
import FollowingModel from "../models/followingModel";
import SubscriberModel from "../models/subscribersModel";
// import upload from "../utils/uploader";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import upload, { uploadToS3 } from "../utils/uploader";

const userController = new UserController()
const middleWare = new Middleware()

const router = Router()

//user Routes
router.post('/register', userController.registerUser)
router.get('/check-email', userController.checkEmail)
router.post('/login', userController.loginuser)
router.get('/userprofile', middleWare.authorize, userController.getUserProfile)
router.get('/users', middleWare.authorize, userController.searchuser)


// router.get('/getbycode', middleWare.authorize, userController.getUserProfile)
router.post('/update', middleWare.authorize, userController.updateUserData)
router.post('/uploadProfilePicture', middleWare.authorize,userController.updateProfilePic)

router.post('/generate-presigned-url', middleWare.authorize, userController.genPresignedurl)

// // Admin routes 
router.post('/adminlogin', userController.adminLogin)
// router.post('/adminregister', userController.registerAdmin)
router.get('/userlist', userController.loadAdminDashboard)
router.put('/userds/:id/status', userController.updateUserStatus)



router.post('/subscribeee' , middleWare.authorize , userController.subscribeuser)
router.post('/unsubscribe' , middleWare.authorize , userController.unsubscribeuser)









export default router