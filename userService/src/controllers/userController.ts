/// contains the request body coming from frontend

import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/userService";
import { generateAdminToken, generateRefreshToken, generateToken } from "../utils/jwtHelper";
import { IUserController } from "../interfaces/uS.controller.interface";
import { ObjectId } from 'mongodb';
import IAuthRequest from "../middlewares/authMiddleware";
import { deleteImagefroms3, generatePresignedURL, getPresignedUrl } from "../utils/up";
import generateOTP from "../utils/otpGenerator";
import { sendEmail } from "../utils/sendEmail";
import bcrypt from 'bcryptjs'

import fs from 'fs'
import path from 'path'
import { client } from "../client";
import redisClient from "../utils/redisClient";
const templatePath = path.join(__dirname, '../utils/templates/emailtemplate.html')
const templateContent = fs.readFileSync(templatePath, 'utf-8');





export class UserController implements IUserController {

    private _userService: UserService

    constructor() {
        this._userService = new UserService()
    }

    // registering a new user
    public registerUser = async (req: Request, res: Response, next: NextFunction) => {
        const { username, email, password, mobile, country } = req.body
        console.log(req.body)
        try {

            const user = await this._userService.registerUser(username, email, password, mobile, country)

            //generating token after registartion
            const token = generateToken(user)

            res.status(201).json({ user, token })

        } catch (error) {
            next(error)
            console.log(error)
            res.status(400).json({ error: "not successfull" })
        }
    }



    // Checking email end points
    public checkEmail = async (req: Request, res: Response) => {
        const { email } = req.query

        try {
            const existinguser = await this._userService.findByemail(email as string)
            if (existinguser) {
                res.status(200).json({ exists: true })
                return
            }
            else {
                res.status(200).json({ exists: false });
                return
            }
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "server error" })
        }
    }



    //loggin in the registered user
    // public loginuser = async (req: Request, res: Response, next: NextFunction) => {
    //     const { email, password } = req.body
    //     console.log(email)

    //     try {

    //         const result = await this._userService.login(email, password)
    //         console.log("data is ", result)

    //         // Check if the user's status is active
    //         if (result.status !== 'active') {

    //             res.status(403).json({ message: 'User is blocked' });
    //             return
    //         }


    //         const token = generateToken(result)
    //         // const userRefreshtoken = generateRefreshToken(result)
    //         // res.status(200).json({ message: 'Login successfull', token, userRefreshtoken })
    //         res.status(200).json({ message: 'Login successfull', token })

    //     } catch (error: any) {


    //         if (error.message === 'invalid email') {
    //             res.status(404).json({ error: 'user not found' })
    //         }
    //         if (error.message == 'Invalid password') {
    //             res.status(401).json({ error: 'Invalid password' })
    //         }

    //         next(error)
    //     }
    // }



    public loginuser = async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
        console.log(email);

        console.log("new hai from login")
       
        try {
            const user = await this._userService.findByemail(email);

            if (!user) {
                // User with the provided email doesn't exist
                res.status(200).json({ success: false, message: 'User not found' });
                return;
            }

            // Check password validity
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                // Password does not match
                res.status(200).json({ success: false, message: 'Invalid password' });
                return;
            }

            // Check if the user is blocked
            if (user.status !== 'active') {
                res.status(200).json({ success: false, message: 'User is blocked' });
                return;
            }

            // Generate a token if login is successful
            const token = generateToken(user);
            res.status(200).json({ success: true, message: 'Login successful', token });

        } catch (error: any) {
            console.error("Error during login:", error);
            res.status(500).json({ error: 'An unexpected error occurred' });
            next(error);
        }
    };




    public generateotp = async (req: Request, res: Response) => {
        const { email } = req.body
        console.log("emailis", email)

        try {

            const existinguser = await this._userService.findByemail(email as string)

            if (existinguser) {

                const otpresult = await this._userService.generateOtpForUser(email);

                // Check if there was an error (e.g., user not found)
                if (otpresult.error) {
                    if (otpresult.error === 'no such user exists') {
                        res.status(404).json({ error: 'User not found' });
                    }
                    // Handle other potential errors here if needed
                    res.status(404).json({ error: 'Unable to generate OTP' });
                }

                // OTP was successfully generated
                console.log("otp", otpresult);
                console.log("otp", otpresult)
                const otpValue = otpresult.otp ?? 'N/A'; // Use 'N/A' as a fallback value or any default string

                const customizedHtml = templateContent.replace('{{otp}}', otpValue);

                await sendEmail({
                    from: "nspious1999@gmail.com",
                    to: email,
                    subject: 'Password Reset OTP',
                    text: `Your OTP for resetting the password is ${otpresult.otp}`,
                    html: customizedHtml
                })

                res.status(200).json({ message: 'OTP sent successfully' });


            }
            else {
                console.log("no such user")
                res.json({ message: 'no such email exists' })
                return
            }





        } catch (error: any) {


            if (error.message === 'invalid email') {
                res.status(404).json({ error: 'user not found' })
            }
            if (error.message == 'Invalid password') {
                res.status(401).json({ error: 'Invalid password' })
            }


        }
    }


    public submitotp = async (req: Request, res: Response) => {
        const { otp, email } = req.body;
        console.log("otp received @backend", otp, email);

        try {
            const checkVAlidOtp = await this._userService.checkReceivedotp(otp, email);

            if (!checkVAlidOtp) {
                // If the OTP is invalid, send the response and return immediately
                res.json({ message: 'Invalid otp' });
                return
            }

            // Send success response if the OTP is valid
            res.status(200).json({ checkVAlidOtp, message: 'success' });
            return
        } catch (error) {
            console.error("Error validating OTP:", error);
            res.status(500).json({ message: 'Internal server error' });
            return
        }
    };



    public resetpassword = async (req: Request, res: Response) => {
        const { password, email } = req.body

        console.log("emai and pass", password, email)

        try {
            const result = await this._userService.resetPassword(email, password)
            if (result.success) {
                res.status(200).json({ message: 'Password reset successful' });
            } else {
                res.status(400).json({ message: result.message });
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }



    public getUserProfile = async (req: Request, res: Response) => {
        const token: any = req.headers.authorization?.split(' ')[1]
        console.log("usera@11", token)
        const userProfile = await this._userService.getUser(token)
        res.status(200).json({ message: 'user details', userProfile })

    }








    public getSubscriberlist = async (req: IAuthRequest, res: Response) => {
        try {
            const userId = req.user?.userId;
    
            if (!userId) {
                 res.status(400).json({ message: 'User ID is required' });
                 return
            }
    
            const getSublist = await this._userService.getsublist(userId);
    
            // console.log("userid @ getsublist", userId);
    
            
            // console.log("sublist after fetching @ controller",getSublist?.subscribers)

            const subscribers = getSublist?.subscribers

            res.status(200).json({ message: 'success', data: subscribers });
    
        } catch (error) {
            console.error('Error fetching subscriber list:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
    
    public getfollowinglist = async (req: IAuthRequest, res: Response) => {
        try {
            const userId = req.user?.userId;
    
            if (!userId) {
                 res.status(400).json({ message: 'User ID is required' });
                 return
            }
    
            const getfollowlist = await this._userService.getFollowinglist(userId);
    
            console.log("userid @ getsublist", userId);
    
            
            console.log("following after fetching @ controller",getfollowlist?.following)

            const following = getfollowlist?.following

            res.status(200).json({ message: 'success', followingdata: following });
    
        } catch (error) {
            console.error('Error fetching subscriber list:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
    


    public searchuser = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const nameQuery = typeof req.query.name === 'string' ? req.query.name : ''; // Ensure nameQuery is a string
            const loggedInUserName = req.user?.name || '';  // Ensure loggedInUserName is a string, fallback to an empty string

            console.log("Searching for users with query:", nameQuery, loggedInUserName);
            const users = await this._userService.searchUsers(nameQuery, loggedInUserName)
            console.log("nesxt ", next)
            res.json(users)
        } catch (error) {
            console.log('ere')
            next(error)

        }
    }

    public userCount = async (req: Request, res: Response) => {
        try {
            const userCounts = await this._userService.usercount(); // Call service method
            res.status(200).json(userCounts); // Send counts in response
        } catch (error) {
            console.error("Internal server error:", error);
            res.status(500).send("Internal server error");
        }
    };




    public getUploadedvideos = async (req: IAuthRequest, res: Response) => {

        console.log("Hai from getUploadedvideos")
        try {
            const userId = req.user?.userId;

            console.log("userId", userId)
            const request = { uploaderId: userId };

            client.GetVideosByUploader(request, (error: any, response: any) => {
                if (error) {
                    console.error("Error fetching videos:", error);
                    res.status(500).send("Failed to fetch videos");
                }

                if (response && response.videos) {
                    console.log("fetching from videoservice in userservice", response.videos);
                    res.status(200).json(response.videos);
                } else {
                    res.status(404).send("No videos found");
                }
            });
        } catch (error) {
            console.error("Internal server error:", error);
            res.status(500).send("Internal server error");
        }
    };




    public genPresignedurl = async (req: IAuthRequest, res: Response) => {
        const { fileName, fileType } = req.body
        try {
            const presignedUrl = await getPresignedUrl(fileName, fileType);
            res.json({ presignedUrl });
        } catch (err) {
            res.status(500).json({ error: "hai" });
        }
    }


    public deletefroms3 = async (req: Request, res: Response) => {
        const { imageurl } = req.body
        console.log(imageurl)

        try {
            const deleteImage = await deleteImagefroms3(imageurl)
            res.json({ deleteImage })

        } catch (error) {
            res.status(500).json({ error: 'there is an error' })

        }
    }



    public generateCommonPresigned = async (req: Request, res: Response) => {
        const { fileName, fileType, bucketname } = req.body
        try {
            const genPresigner = await generatePresignedURL(bucketname, fileType, fileName)
            res.json({ genPresigner })
        } catch (error) {
            res.status(500).json({ error: 'there is an error' })
        }
    }






    public updateUserData = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        console.log("at controller")
        const loggedInUserId = req.user?.userId || '';  // Ensure loggedInUserName is a string, fallback to an empty string

        const { userId, name, image, email, phonenumber, country } = req.body
        console.log("useridddd", loggedInUserId)
        console.log(name, image, email, phonenumber, country)
        console.log(userId)
        try {
            const updatedProfile = await this._userService.updateProfile(loggedInUserId, { name, email, phonenumber, country })
            res.status(200).json({ message: 'Profile updated successfully', updatedProfile });

        } catch (error) {
            next(error)
        }
    }

    public updateProfilePic = async (req: any, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { s3FileUrl } = req.body;
            const file = req.file
            const userId = req.user?.userId; // Access the logged-in user's details
            console.log("emdi", req.user)
            console.log("req.body", s3FileUrl)

            // if (!file) {
            //     res.status(400).json({ error: 'File upload failed' });
            // }
            const result = await this._userService.updateProfilePic(userId, s3FileUrl);

            console.log("res", result)
            res.status(200).json({ imagePath: result.imagePath, user: result.updatedUser })


        } catch (error) {
            next(error)
        }
    }

    public subscribeuser = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {

            const userId = req.user?.userId
            const { channelId } = req.body
            console.log(`userId${userId} : channelid:${channelId}`)
            if (!channelId && !userId) {
                return
            }

            const result = await this._userService.updateSubscriptions(userId, channelId)
            res.status(200).json({ message: 'subscribe successs' })
        } catch (error) {

        }
    }

    public unsubscribeuser = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {

            const userId = req.user?.userId
            const { channelId } = req.body
            console.log(`userId${userId} : channelid:${channelId}`)
            if (!channelId && !userId) {
                return
            }

            const result = await this._userService.updateUnSubscriptions(userId, channelId)
            res.status(200).json({ message: 'unsubscribed successfully' })
        } catch (error) {

        }
    }




    ///Admin controller
    public adminLogin = async (req: Request, res: Response) => {
        const { email, password } = req.body
        console.log("admin data is", email)

        try {
            const admin = await this._userService.adminLogin(email, password)
            console.log("data is ", admin)
            const token = generateAdminToken(admin)
            res.status(200).json({ message: 'Login successfull', token })
        } catch (error) {

        }
    }




    public loadAdminDashboard = async (req: Request, res: Response): Promise<void> => {
        try {



            // Get page and limit from query params, with defaults for the first page and 6 items per page
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 6;
            const search = typeof req.query.search === 'string' ? req.query.search : '';

            console.log("search term @controller", search)

            console.log(`page is ${page} limit : ${limit}`)
            console.log("Controller: loadAdminDashboard");


            const allUsers = await this._userService.getAllUsers(page, limit, search);
            // Calculate total users and pages for pagination
            const totalUsers = await this._userService.countAllUsers();
            const totalPages = Math.ceil(totalUsers / limit);


            console.log(`totalusers:${totalUsers}  totalPages:${totalPages}`)
            // console.log("Fetched Users:", allUsers);


            res.status(200).json({
                users: allUsers,
                totalPages,
                currentPage: page
            });
        } catch (error) {

            console.error("Error in loadAdminDashboard:", error);


            res.status(500).json({ message: 'Failed to load users' });
        }
    }

    public updateUserStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log("Hai I ma herer")
            const { id } = req.params
            const { status } = req.body
            console.log(id, status)

            if (!ObjectId.isValid(id)) {
                res.status(400).json({ message: 'Invalid user ID' });
            }
            // Call the service method to update the user status
            const updatedUser = await this._userService.updateUserStatus(id, status);

            if (!updatedUser) {
                res.status(404).json({ message: 'User not found' });

            }

            // Respond with the updated user
            res.status(200).json({ message: 'User status updated successfully', user: updatedUser });


        } catch (error) {
            console.error('Error updating user status:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }


}























