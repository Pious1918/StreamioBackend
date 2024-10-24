import { Request, Response } from "express";
import { IuserDocument } from "../models/userModel";
import { IadminDocument } from "../models/adminModel";

export interface IUserService {
    registerUser(name: string, email: string, password: string, phonenumber: string, country: string): Promise<IuserDocument>,
    
    findByemail(email: string): Promise<IuserDocument | null>;

    // User login
    login(email: string, password: string): Promise<IuserDocument>;

    // Get user from token
    getUser(token: string): Promise<IuserDocument | null>;

    // Search for users
    searchUsers(nameQuery: string, loggedInUserName: string): Promise<IuserDocument[]>;

    // Admin login
    adminLogin(email: string, password: string): Promise<IadminDocument>;

    // Get all users (admin)
    getAllUsers(): Promise<IuserDocument[]>;

    // Update user profile
    updateProfile(userId: string, updateFields: {
        name?: string;
        email?: string;
        phonenumber?: string;
        country?: string;
    }): Promise<IuserDocument | null>;

    // Update user profile picture
    updateProfilePic(userId: string, file: any): Promise<{ imagePath: string; updateProfileImage: IuserDocument | null }>;

    // Update subscriptions (add a subscription)
    updateSubscriptions(userid: string, channelid: string): Promise<IuserDocument | null>;

    // Update unsubscriptions (remove a subscription)
    updateUnSubscriptions(userid: string, channelid: string): Promise<IuserDocument | null>;

    // Update user status
    updateUserStatus(id: string, status: string): Promise<IuserDocument | null>;
    // userDetails(email: string): Promise<IuserDocument | null>;

    
    // login(email: string, password: string): Promise<IuserDocument>;

    
    // getUser(token: string): Promise<IuserDocument | null>;

    
    // adminLogin(email: string, password: string): Promise<IadminDocument>;

    
    // registerAdmin(
    //     name: string,
    //     email: string,
    //     password: string,
    //     phonenumber: string,
    //     country: string
    // ): Promise<IadminDocument>;

    
    // getAllUsers(): Promise<IuserDocument[]>;

    
    // updateProfile(
    //     userId: string,
    //     updateFields: {
    //         name?: string;
    //         email?: string;
    //         phonenumber?: string;
    //         country?: string;
    //     }
    // ): Promise<IuserDocument | null>;
}