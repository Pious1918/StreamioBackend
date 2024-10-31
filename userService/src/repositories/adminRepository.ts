import { IAdminRepository } from "../interfaces/admin.repo.interface";
import adminModel, { IadminDocument } from "../models/adminModel";
import userModel, { IuserDocument } from "../models/userModel";
import { BaseRepository } from "./baseRepo";
import { userRepository } from "./userRepository";





///adminrepository classs extends baserepo : means it inherits all the methods defined in baserepo
export class adminRepostiory extends BaseRepository<IadminDocument> implements IAdminRepository {

    private userRepository: userRepository

    constructor() {

        super(adminModel) //passing the adminModel to the BaseRepository constructor
        //here it calls the constructor of baserepo to work with adminmodel 

        this.userRepository = new userRepository()
    }

    async findByEmailAndRole(email: string, role: string): Promise<IadminDocument | null> {

        console.log("herer")
        return this.findOne({ email })  ///this.findone refers to the method in the parent class which baseRepo
    }


    // async getAllUsers(limit: number, offset: number): Promise<any> {
    //     try {
    //         return this.userRepository.getAllUsers()
    //     } catch (error) {
    //         // Log and throw the error to be handled at the service level
    //         console.error("Error in getAllUsers repository:", error);
    //         throw new Error('Error fetching users from the database');
    //     }
    // }

    async getAllUsers(page: number, limit: number): Promise<IuserDocument[]> {
        try {
            const offset = (page - 1) * limit;
            const allUsers = await this.userRepository.getAllUsers(limit, offset);
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