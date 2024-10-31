import { IuserDocument } from "../models/userModel";

export interface IUserRepository {
    findByEmail(email: string): Promise<IuserDocument | null>;
    createUser(userData: Partial<IuserDocument>): Promise<IuserDocument | null>;
    updateProfileByUserId(userId: string, updatedFields: any): Promise<any>;
    updateProfilePicture(userId: string, imageUrl: string): Promise<IuserDocument | null>;
    updateSub(userId: string, channelId: string): Promise<IuserDocument | null>;
    updateUnSub(userId: string, channelId: string): Promise<IuserDocument | null>;
    // getAllUsers(): Promise<IuserDocument[]>;
    getAllUsers(limit: number, offset: number): Promise<IuserDocument[]>; // Updated with limit and offset

    updateUserStatus(id: string, status: string): Promise<IuserDocument | null>;
    findUsers(nameQuery: string, loggedInUserName: string): Promise<IuserDocument[]>;
}
