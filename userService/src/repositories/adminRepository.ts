import adminModel, { IadminDocument } from "../models/adminModel";
import { BaseRepository } from "./baseRepo";
import { userRepository } from "./userRepository";


///adminrepository classs extends baserepo : means it inherits all the methods defined in baserepo

export class adminRepostiory extends BaseRepository<IadminDocument> {

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


    async getAllUsers(): Promise<any> {
        try {
            return this.userRepository.getAllUsers()
        } catch (error) {
            // Log and throw the error to be handled at the service level
            console.error("Error in getAllUsers repository:", error);
            throw new Error('Error fetching users from the database');
        }
    }



}