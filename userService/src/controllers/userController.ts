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
import { StatusCodes } from "../enums/statusCode.enums";



const templatePath = path.join(__dirname, '../utils/templates/emailtemplate.html')
const templateContent = fs.readFileSync(templatePath, 'utf-8');





export class UserController implements IUserController {

    private _userService: UserService

    constructor() {
        this._userService = new UserService()
    }



    public registerUser = async (req: Request, res: Response, next: NextFunction) => {
        const { username, email, password, mobile, country } = req.body
        try {

            const [existingEmail, existingUsername] = await Promise.all([
                this._userService.findByemail(email as string),
                this._userService.findByUsername(username as string)
            ]);

            const existmessages: { email?: string; username?: string } = {};
            if (existingEmail) existmessages.email = "Email already exists";
            if (existingUsername) existmessages.username = "Username already exists";

            if (Object.keys(existmessages).length > 0) {
                res.status(StatusCodes.OK).json({ existmessages });
                return
            }

            const user = await this._userService.registerUser(username, email, password, mobile, country)
            const token = generateToken(user)
            res.status(StatusCodes.CREATED).json({ user, token })

        } catch (error) {
            next(error)
            console.log(error)
            res.status(StatusCodes.BAD_REQUEST).json({ error: "not successfull" })
        }
    }



    public checkEmail = async (req: Request, res: Response) => {
        const { email } = req.query

        try {
            const existinguser = await this._userService.findByemail(email as string)
            if (existinguser) {
                res.status(StatusCodes.OK).json({ exists: true })
                return
            }
            else {
                res.status(StatusCodes.OK).json({ exists: false });
                return
            }
        } catch (error) {
            console.error(error)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "server error" })
        }
    }




    public loginuser = async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
        try {
            const user = await this._userService.findByemail(email);

            if (!user) {
                res.status(StatusCodes.OK).json({ success: false, message: 'User not found' });
                return;
            }

            // Check password validity
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                res.status(StatusCodes.OK).json({ success: false, message: 'Invalid password' });
                return;
            }

            if (user.status !== 'active') {
                res.status(StatusCodes.OK).json({ success: false, message: 'User is blocked' });
                return;
            }

            const token = generateToken(user);
            res.status(StatusCodes.OK).json({ success: true, message: 'Login successful', token });

        } catch (error: any) {
            console.error("Error during login:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'An unexpected error occurred' });
            next(error);
        }
    };




    public generateotp = async (req: Request, res: Response) => {
        const { email } = req.body
        try {

            const existinguser = await this._userService.findByemail(email as string)

            if (existinguser) {

                const otpresult = await this._userService.generateOtpForUser(email);

                if (otpresult.error) {
                    if (otpresult.error === 'no such user exists') {
                        res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
                    }
                    res.status(StatusCodes.NOT_FOUND).json({ error: 'Unable to generate OTP' });
                }

                console.log("otp", otpresult);
                const otpValue = otpresult.otp ?? 'N/A'; // Use 'N/A' as a fallback value or any default string

                const customizedHtml = templateContent.replace('{{otp}}', otpValue);

                await sendEmail({
                    from: "nspious1999@gmail.com",
                    to: email,
                    subject: 'Password Reset OTP',
                    text: `Your OTP for resetting the password is ${otpresult.otp}`,
                    html: customizedHtml
                })
                res.status(StatusCodes.OK).json({ message: 'OTP sent successfully' });
            }
            else {
                console.log("no such user")
                res.json({ message: 'no such email exists' })
                return
            }

        } catch (error: any) {

            if (error.message === 'invalid email') {
                res.status(StatusCodes.NOT_FOUND).json({ error: 'user not found' })
            }
            if (error.message == 'Invalid password') {
                res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid password' })
            }
        }
    }




    public submitotp = async (req: Request, res: Response) => {
        const { otp, email } = req.body;

        try {
            const checkVAlidOtp = await this._userService.checkReceivedotp(otp, email);

            if (!checkVAlidOtp) {
                res.json({ message: 'Invalid otp' });
                return
            }

            res.status(StatusCodes.OK).json({ checkVAlidOtp, message: 'success' });
            return
        } catch (error) {
            console.error("Error validating OTP:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
            return
        }
    };



    public resetpassword = async (req: Request, res: Response) => {
        const { password, email } = req.body

        try {
            const result = await this._userService.resetPassword(email, password)
            if (result.success) {
                res.status(StatusCodes.OK).json({ message: 'Password reset successful' });
            } else {
                res.status(StatusCodes.BAD_REQUEST).json({ message: result.message });
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
        }
    }



    public getUserProfile = async (req: Request, res: Response) => {
        const token: any = req.headers.authorization?.split(' ')[1]
        const userProfile = await this._userService.getUser(token)
        res.status(StatusCodes.OK).json({ message: 'user details', userProfile })

    }



    public getSubscriberlist = async (req: IAuthRequest, res: Response) => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID is required' });
                return
            }

            const getSublist = await this._userService.getsublist(userId);
            const subscribers = getSublist?.subscribers
            res.status(StatusCodes.OK).json({ message: 'success', data: subscribers });

        } catch (error) {
            console.error('Error fetching subscriber list:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
        }
    };




    public getfollowinglist = async (req: IAuthRequest, res: Response) => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID is required' });
                return
            }

            const getfollowlist = await this._userService.getFollowinglist(userId);
            const following = getfollowlist?.following
            res.status(StatusCodes.OK).json({ message: 'success', followingdata: following });

        } catch (error) {
            console.error('Error fetching subscriber list:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
        }
    };



    public searchuser = async (req: IAuthRequest, res: Response, next: NextFunction) => {
        try {
            const nameQuery = typeof req.query.name === 'string' ? req.query.name : '';
            const loggedInUserName = req.user?.name || '';
            const users = await this._userService.searchUsers(nameQuery, loggedInUserName)
            res.json(users)
        } catch (error) {
            console.log(error)
            next(error)

        }
    }



    public userCount = async (req: Request, res: Response) => {
        try {
            const userCounts = await this._userService.usercount(); 
            res.status(StatusCodes.OK).json(userCounts);
        } catch (error) {
            console.error("Internal server error:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
        }
    };



    public getUploadedvideos = async (req: IAuthRequest, res: Response) => {

        try {
            const userId = req.user?.userId;
            const request = { uploaderId: userId };

            client.GetVideosByUploader(request, (error: any, response: any) => {
                if (error) {
                    console.error("Error fetching videos:", error);
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Failed to fetch videos");
                }

                if (response && response.videos) {
                    console.log("fetching from videoservice in userservice", response.videos);
                    res.status(StatusCodes.OK).json(response.videos);
                } else {
                    res.status(StatusCodes.NOT_FOUND).send("No videos found");
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
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "hai" });
        }
    }



    public deletefroms3 = async (req: Request, res: Response) => {
        const { imageurl } = req.body

        try {
            const deleteImage = await deleteImagefroms3(imageurl)
            res.json({ deleteImage })

        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'there is an error' })

        }
    }



    public generateCommonPresigned = async (req: Request, res: Response) => {
        const { fileName, fileType, bucketname } = req.body
        try {
            const genPresigner = await generatePresignedURL(bucketname, fileType, fileName)
            res.json({ genPresigner })
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'there is an error' })
        }
    }



    public updateUserData = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        
        const loggedInUserId = req.user?.userId || ''; 
        const { userId, name, image, email, phonenumber, country } = req.body

        try {
            const updatedProfile = await this._userService.updateProfile(loggedInUserId, { name, email, phonenumber, country })
            res.status(StatusCodes.OK).json({ message: 'Profile updated successfully', updatedProfile });

        } catch (error) {
            next(error)
        }
    }

    public updateProfilePic = async (req: any, res: Response, next: NextFunction): Promise<void> => {
        try {

            const { s3FileUrl } = req.body;
            const file = req.file
            const userId = req.user?.userId; 
            const result = await this._userService.updateProfilePic(userId, s3FileUrl);
            res.status(StatusCodes.OK).json({ imagePath: result.imagePath, user: result.updatedUser })

        } catch (error) {
            next(error)
        }
    }



    public subscribeuser = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {

            const userId = req.user?.userId
            const { channelId } = req.body

            if (!channelId && !userId) {
                return
            }

            const result = await this._userService.updateSubscriptions(userId, channelId)
            res.status(StatusCodes.OK).json({ message: 'subscribe successs' })
        } catch (error) {

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'there is an error' })

        }
    }



    public unsubscribeuser = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {

            const userId = req.user?.userId
            const { channelId } = req.body
            if (!channelId && !userId) {
                return
            }

            const result = await this._userService.updateUnSubscriptions(userId, channelId)
            res.status(StatusCodes.OK).json({ message: 'unsubscribed successfully' })
        } catch (error) {

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'there is an error' })

        }
    }



    public getBanneruser = async (req: Request, res: Response) => {

        try {

            const getbanner = await this._userService.getBanner()
            res.status(StatusCodes.OK).json({ getbanner, message: 'banner fetching is successfull' })

        } catch (error) {
            console.error("error getting banner")
        }
    }



    public adminLogin = async (req: Request, res: Response) => {
        const { email, password } = req.body

        try {
            const admin = await this._userService.adminLogin(email, password)
            const token = generateAdminToken(admin)
            res.status(StatusCodes.OK).json({ message: 'Login successfull', token })
        } catch (error) {
            
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'there is an error' })

        }
    }



    public loadAdminDashboard = async (req: Request, res: Response): Promise<void> => {
        try {

            // Getting page and limit from query params, with defaults for the first page and 6 items per page
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 6;
            const search = typeof req.query.search === 'string' ? req.query.search : '';
            const allUsers = await this._userService.getAllUsers(page, limit, search);
            const totalUsers = await this._userService.countAllUsers();
            const totalPages = Math.ceil(totalUsers / limit);

            res.status(StatusCodes.OK).json({
                users: allUsers,
                totalPages,
                currentPage: page
            });
        } catch (error) {

            console.error("Error in loadAdminDashboard:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to load users' });
        }
    }



    public updateUserStatus = async (req: Request, res: Response): Promise<void> => {

        try {

            const { id } = req.params
            const { status } = req.body

            if (!ObjectId.isValid(id)) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid user ID' });
            }

            const updatedUser = await this._userService.updateUserStatus(id, status);

            if (!updatedUser) {

                res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });

            }

            res.status(StatusCodes.OK).json({ message: 'User status updated successfully', user: updatedUser });

        } catch (error) {

            console.error('Error updating user status:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });

        }
    }


}























