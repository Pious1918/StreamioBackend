import bcrypt from 'bcryptjs'
import { userRepository } from '../repositories/userRepository'
import { IuserDocument } from '../models/userModel'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import { IadminDocument } from '../models/adminModel';
import { IUserService } from '../interfaces/uS.service.interface';
import { uploadToS3 } from '../utils/uploader';
import { adminRepostiory } from '../repositories/adminRepository';
import generateOTP from '../utils/otpGenerator';

dotenv.config()

export class UserService implements IUserService {

    private _userRepository!: userRepository;
    private _adminRepository!: adminRepostiory;

    constructor() {
        this._userRepository = new userRepository()
        this._adminRepository = new adminRepostiory()
    }



    async registerUser(name: string, email: string, password: string, phonenumber: string, country: string): Promise<IuserDocument> {

        const existingUser = await this._userRepository.findByEmail(email)
        if (existingUser) {
            throw new Error("User already exists")
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const newUser = await this._userRepository.createUser({
            name,
            email,
            password: hashPassword,
            phonenumber,
            country,
            role: 'user'
        })

        if (!newUser) {
            throw new Error("Failed to create user");
        }
        return newUser;
    }


    async findByemail(email: string): Promise<IuserDocument | null> {
        return this._userRepository.findByEmail(email)
    }

    async findByUsername(name: string): Promise<IuserDocument | null> {
        return this._userRepository.findOne({ name });
    }


    async login(email: string, password: string): Promise<IuserDocument> {

        const user = await this._userRepository.findByEmail(email)

        if (!user) {
            throw new Error('invalid email')
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {
            console.log("nott hererere")
            throw new Error('Invalid password')
        }

        return user
    }



    async generateOtpForUser(email: string): Promise<{ error?: string, otp?: string }> {

        const existingUser = await this._userRepository.findByEmail(email)

        if (!existingUser) {
            console.log("not exis")
            throw new Error('invalid email')
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
        await this._userRepository.saveOtp(email, otp, expiresAt)
        return { otp }

    }


    async checkReceivedotp(otp: string, email: string) {

        const emailExists = await this._userRepository.findotpByEmailandotp(email, otp)
        return emailExists

    }


    async resetPassword(email: string, newPassword: string) {
        try {

            const hashPassword = await bcrypt.hash(newPassword, 10)
            const updateResult = await this._userRepository.updatePasswordByEmail(email, hashPassword);

            if (updateResult) {
                return { success: true, message: 'Password reset successfully' };
            } else {
                return { success: false, message: 'User not found' };
            }

        } catch (error) {

            console.error('Error in resetPassword service:', error);
            return { success: false, message: 'Failed to reset password' };

        }

    }



    async getUser(token: string): Promise<IuserDocument | null> {

        if (!token) {
            throw new Error("No token provided")
        }

        try {

            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string)
            let email = decoded.email
            const user = await this._userRepository.findByEmail(email)
            return user

        } catch (error) {
            console.error("Error in getUser:", error);
            return null;
        }
    }


    async getsublist(userId: string) {
        try {

            const getsubscribers = await this._userRepository.getAllsubscribers(userId)
            return getsubscribers

        } catch (error) {

            console.log(error)

        }
    }

    async getBanner(){
        const getbanner = await this._adminRepository.getbanner()
        return getbanner
    }

    async getFollowinglist(userId: string) {
        try {

            const getsubscribers = await this._userRepository.getAllfollowing(userId)
            return getsubscribers

        } catch (error) {

            console.log(error)

        }
    }


    async searchUsers(nameQuery: string, loggedInUserName: string): Promise<IuserDocument[]> {
        try {

            const users = await this._userRepository.findUsers(nameQuery, loggedInUserName);
            return users || [];

        } catch (error) {
            console.error("error in search user", error)
            return [];
        }
    }


    async usercount() {
        try {

            const userCounts = await this._userRepository.userCount();
            return userCounts;

        } catch (error) {

            console.error("Error in service layer:", error);
            throw error;

        }
    }


    async updateProfile(userId: any, updateFields: any): Promise<any> {
        try {
            const updatedFields: any = {}

            if (updateFields.name) {
                updatedFields.name = updateFields.name
            }

            if (updateFields.email) {
                updatedFields.email = updateFields.email
            }

            if (updateFields.phonenumber) {
                updatedFields.phonenumber = updateFields.phonenumber
            }

            if (updateFields.country) {
                updatedFields.country = updateFields.country
            }

            return await this._userRepository.updateProfileByUserId(userId, updatedFields)


        } catch (error) {
            console.log(error)
        }
    }


    async updateProfilePic(userId: string, file: any): Promise<any> {

        try {

            const updateProfileImage = await this._userRepository.updateProfilePicture(userId, file)
            return { imagePath: file, updateProfileImage }

        } catch (error) {
            console.error('Error updating profile picture:', error);
            throw new Error('Failed to update profile picture');
        }

    }


    async updateSubscriptions(userid: any, channelid: string): Promise<any> {

        try {

            return await this._userRepository.updateSub(userid, channelid)

        } catch (error) {
            console.log(error)
        }
    }


    async updateUnSubscriptions(userid: any, channelid: string): Promise<any> {

        try {

            return await this._userRepository.updateUnSub(userid, channelid)

        } catch (error) {
            console.log(error)
        }

    }


    async adminLogin(email: string, password: string): Promise<IadminDocument> {

        const user = await this._adminRepository.findByEmailAndRole(email, 'admin');

        if (!user) {
            throw new Error('Invalid email or not an admin');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw new Error('Invalid password');
        }

        return user;

    }



    async getAllUsers(page: number, limit: number, search: string): Promise<any> {
        try {

            const allUsers = await this._adminRepository.getAllUsers(page, limit, search);
            return allUsers;


        } catch (error) {

            console.error("Error in getAllUsers:", error);
            throw new Error('Error fetching users from the service');

        }
    }

    async countAllUsers(): Promise<number> {
        try {

            return await this._adminRepository.countAllUsers();

        } catch (error) {

            console.error("Error in countAllUsers:", error);
            throw new Error('Error counting users from the service');

        }
    }


    async updateUserStatus(id: string, status: string): Promise<any> {
        try {

            const updatedUser = await this._userRepository.updateUserStatus(id, status);
            return updatedUser;

        } catch (error) {

            throw new Error(`Error in updating user status:`);

        }
    }

}