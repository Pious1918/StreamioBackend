import { FilterQuery } from "mongoose";
import userModel, { IuserDocument } from "../models/userModel";
import { BaseRepository } from "./baseRepo";
import { IUserRepository } from "../interfaces/user.repo.interface";
import otpModel from "../models/otpModel";



export class userRepository extends BaseRepository<IuserDocument> implements IUserRepository {
    
    constructor() {
        super(userModel)
    }

    
    async findByEmail(email: string): Promise<IuserDocument | null> {
        return this.findOne({ email })
    }

    async getAllsubscribers(userId :string){
       return await userModel.findById(userId).populate('subscribers', 'name email'); // Populate subscribers with name and email only
    }

    async getAllfollowing(userId :string){
       return await userModel.findById(userId).populate('following', 'name email'); // Populate subscribers with name and email only
    }

    async createUser(userData: Partial<IuserDocument>): Promise<IuserDocument | null> {
        return this.save(userData)
    }

    async saveOtp(email: string, otp: string, expiresAt: Date): Promise<void> {
        await otpModel.create({ email, otp, expiresAt });

    }

    async findotpByEmailandotp(email: string, otp: string) {
        return await otpModel.findOne({ email, otp })
    }


    async updatePasswordByEmail(email: string, newPassword: string) {
        try {

            const result = await userModel.findOneAndUpdate(
                { email: email },
                { password: newPassword },
                { new: true }
            )
            return result

        } catch (error) {
            console.error('Error in updatePasswordByEmail repository method:', error);
            throw error;
        }
    }

    async updateProfileByUserId(userId: any, updatedFields: any): Promise<any> {
        try {

            return this.findByIdAndUpdate(userId, updatedFields)

        } catch (error) {
            console.error("Error updating profile:", error);
            throw new Error("Profile update failed"); 
        }
    }


    async updateProfilePicture(userId: string, imageUrl: string): Promise<IuserDocument | null> {
        try {

            return this.findByIdAndUpdate(userId, { profilepicture: imageUrl });

        } catch (error) {
            console.error('Error updating user profile picture in the repository:', error);
            throw error;
        }
    }


    async updateSub(userId: any, channelId: any): Promise<IuserDocument | null> {
        try {

            const followingField = 'following';  
            const subscribersField = 'subscribers';  
            const userUpdate = this.findAndUpdateSet(userId, followingField, channelId)
            const channelupdate = this.findAndUpdateSet(channelId, subscribersField, userId)
            return userUpdate

        } catch (error) {
            console.error("error updating subscriber")
            throw error

        }
    }


    async updateUnSub(userId: any, channelId: any): Promise<IuserDocument | null> {
        try {

            const followingField = 'following'; 
            const subscribersField = 'subscribers';
            const userUpdate = this.uNfindAndUpdateSet(userId, followingField, channelId)
            const channelupdate = this.uNfindAndUpdateSet(channelId, subscribersField, userId)
            return userUpdate

        } catch (error) {
            console.error("error updating subscriber")
            throw error
        }

    }


    async getAllUsers(limit: number, offset: number, search: string): Promise<IuserDocument[]> {
        try {

            const query: any = search ? {
                name: { $regex: search, $options: 'i' } 
            } : {};

            const users = await userModel.find(query)
                .sort({ createdAt: -1 }) 
                .limit(limit)
                .skip(offset); 
            return users;

        } catch (error) {
            console.error("Error in getAllUsers repository:", error);
            throw new Error('Error fetching users from the database');
        }
    }



    async updateUserStatus(id: string, status: string): Promise<IuserDocument | null> {
        try {

            return this.findByIdAndUpdate(id, { status: status });

        } catch (error) {
            throw new Error(`Error in updating user status`);
        }
    }


    async userCount() {
        try {

            const totalUsers = await userModel.countDocuments(); 
            const activeUsers = await userModel.countDocuments({ status: "active" });
            const blockedUsers = await userModel.countDocuments({ status: "blocked" });
            return { totalUsers, activeUsers, blockedUsers }; 

        } catch (error) {
            console.error("Error counting users:", error);
            throw error;
        }
    }


    async findUsers(nameQuery: string, loggedInUserName: string) {
        try {

            const query: FilterQuery<IuserDocument> = {
                $and: [
                    { name: { $regex: `^${nameQuery}`, $options: 'i' } },  
                    { name: { $ne: loggedInUserName } }  
                ]
            };

            const users = await userModel.find(query)
            return users;

        } catch (error) {

            throw new Error("Error while querying the database: " + error);
            
        }
    }
}


































//     async createAdmin(admindata: Partial<IadminDocument>): Promise<IadminDocument> {
//         const admin = new adminModel(admindata)
//         console.log("@repo", admin)
//         return admin.save()
//     }