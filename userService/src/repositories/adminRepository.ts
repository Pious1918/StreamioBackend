import { IAdminRepository } from "../interfaces/admin.repo.interface";
import adminModel, { IadminDocument } from "../models/adminModel";
import bannerModel from "../models/bannerModel";
import userModel, { IuserDocument } from "../models/userModel";
import { BaseRepository } from "./baseRepo";
import { userRepository } from "./userRepository";
import mongoose from 'mongoose';

interface BannerData {
    title: string;
    description: string;
    image: string;
  }
  



export class adminRepostiory extends BaseRepository<IadminDocument> implements IAdminRepository {

    private userRepository: userRepository

    constructor() {

        super(adminModel) 
        this.userRepository = new userRepository()
    }


    async findByEmailAndRole(email: string, role: string): Promise<IadminDocument | null> {
        return this.findOne({ email })
    }


    async saveBanner(bannerdata:BannerData){
       return await bannerModel.create(bannerdata)
    }


    async getbanner(){
        return await bannerModel.find()
    }


    async deleteBanner(id:string){
        const objectId = new mongoose.Types.ObjectId(id);
        return await bannerModel.findOneAndDelete({_id: objectId})
    }


    async getAllUsers(page: number, limit: number, search: string): Promise<IuserDocument[]> {
        try {

            const offset = (page - 1) * limit;
            const allUsers = await this.userRepository.getAllUsers(limit, offset , search);
            return allUsers;

        } catch (error) {
            console.error("Error in getAllUsers service:", error);
            throw new Error('Error fetching users from the service');
        }
    }
    

    async countAllUsers(): Promise<number> {

        try {

            return await userModel.countDocuments();

        } catch (error) {

            console.error("Error in countAllUsers repository:", error);
            throw new Error('Error counting users from the database');
            
        }
    }
    


}