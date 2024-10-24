import bcrypt from 'bcryptjs'

import { userRepository } from '../repositories/userRepository'

import { IuserDocument } from '../models/userModel'

import jwt from 'jsonwebtoken'; // Correct import statement for jsonwebtoken
import dotenv from 'dotenv'
import { IadminDocument } from '../models/adminModel';
import { IUserService } from '../interfaces/uS.service.interface';
import { uploadToS3 } from '../utils/uploader';
import { adminRepostiory } from '../repositories/adminRepository';

dotenv.config()

export class UserService implements IUserService {

    private _userRepository!: userRepository;
    private _adminRepository!: adminRepostiory;

    constructor() {
        this._userRepository = new userRepository()
        this._adminRepository = new adminRepostiory()
    }


    //register new user
    async registerUser(name: string, email: string, password: string, phonenumber: string, country: string): Promise<IuserDocument> {

        const existingUser = await this._userRepository.findByEmail(email)
        if (existingUser) {
            throw new Error("User already exists")
        }

        const hashPassword = await bcrypt.hash(password, 10)
        console.log("Here at services", hashPassword)

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



    
    async login(email: string, password: string): Promise<IuserDocument> {

        const user = await this._userRepository.findByEmail(email)

        if (!user) {
            throw new Error('invalid email')
        }

        const isValidPassword = await bcrypt.compare(password, user.password)
        console.log("hti", isValidPassword)
        if (!isValidPassword) {
            console.log("nott hererere")
            throw new Error('Invalid password')
        }

        return user
    }


    async getUser(token: string): Promise<IuserDocument | null> {
        if (!token) {
            throw new Error("No token provided")
        }

        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string)
            console.log("@serv", decoded.userId)
            let email = decoded.email
            const user = await this._userRepository.findByEmail(email)
            console.log("user iss", user)
            return user
        } catch (error) {
            console.error("Error in getUser:", error);
            return null;
        }
    }

    async searchUsers(nameQuery: string, loggedInUserName: string): Promise<IuserDocument[]> {
        try {
            console.log("@service", nameQuery, loggedInUserName);
            const users = await this._userRepository.findUsers(nameQuery, loggedInUserName);

            // Return an empty array if users is undefined
            return users || [];
        } catch (error) {
            console.error("error in search user", error)
            return [];
        }
    }



    // async adminLogin(email: string, password: string): Promise<IadminDocument> {

    //     const user = await this._userRepository.findByEmailAndRole(email, 'admin');

    //     console.log("admin", user)

    //     if (!user) {
    //         throw new Error('Invalid email or not an admin');
    //     }



    //     const isValidPassword = await bcrypt.compare(password, user.password);

    //     if (!isValidPassword) {
    //         throw new Error('Invalid password');
    //     }


    //     return user;

    // }



    // //register admin
    // async registerAdmin(name: string, email: string, password: string, phonenumber: string, country: string): Promise<IadminDocument> {

    //     const existingUser = await this._userRepository.findByEmailAdmin(email)
    //     if (existingUser) {
    //         throw new Error("admin already exists")
    //     }

    //     const hashPassword = await bcrypt.hash(password, 10)
    //     console.log("Here at services", hashPassword)

    //     return this._userRepository.createAdmin({
    //         name,
    //         email,
    //         password: hashPassword,
    //         phonenumber,
    //         country,
    //         role: 'admin'
    //     })

    // }


    // async getAllUsers(): Promise<any> {
    //     try {

    //         const allUsers = await this._userRepository.getAllUsers();
    //         return allUsers;
    //     } catch (error) {

    //         console.error("Error in getAllUsers:", error);
    //         throw new Error('Error fetching users from the service');
    //     }
    // }


    async updateProfile(userId: any, updateFields: any): Promise<any> {
        try {
            const updatedFields: any = {}
            console.log("@service", updateFields)
            console.log(userId)
            if (updateFields.name) {
                console.log("hai rom name", updateFields.name)
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
            console.log("hai tehrer", userId)
            return await this._userRepository.updateProfileByUserId(userId, updatedFields)


        } catch (error) {

        }
    }


    async updateProfilePic(userId: string, file: any): Promise<any> {
        try {

            console.log("@service of profilepic")
            // Upload file to S3 and get the image URL

            // console.log(`email is ${userId} , imageurl ${imageUrl}`)
            const updateProfileImage = await this._userRepository.updateProfilePicture(userId, file)
            return { imagePath: file, updateProfileImage }
        } catch (error) {
            console.error('Error updating profile picture:', error);
            throw new Error('Failed to update profile picture');
        }
    }


    async updateSubscriptions(userid: any, channelid: string): Promise<any> {

        console.log(`user@servi ${userid} : ${channelid}`)
        try {

            return await this._userRepository.updateSub(userid, channelid)

        } catch (error) {

        }
    }
    async updateUnSubscriptions(userid: any, channelid: string): Promise<any> {

        console.log(`user@servi ${userid} : ${channelid}`)
        try {

            return await this._userRepository.updateUnSub(userid, channelid)

        } catch (error) {

        }
    }




    async adminLogin(email: string, password: string): Promise<IadminDocument> {

        const user = await this._adminRepository.findByEmailAndRole(email, 'admin');

        console.log("admin", user)

        if (!user) {
            throw new Error('Invalid email or not an admin');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw new Error('Invalid password');
        }


        return user;

    }



    async getAllUsers(): Promise<any> {
        try {

            const allUsers = await this._adminRepository.getAllUsers();
            return allUsers;
        } catch (error) {

            console.error("Error in getAllUsers:", error);
            throw new Error('Error fetching users from the service');
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