import { Request, Response } from "express";
import { IuserDocument } from "../models/userModel";
import { IadminDocument } from "../models/adminModel";

export interface IUserService {
    registerUser(name: string, email: string, password: string, phonenumber: string, country: string): Promise<IuserDocument>,
    
    findByemail(email: string): Promise<IuserDocument | null>;

   
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