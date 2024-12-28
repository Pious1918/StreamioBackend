import { IadminDocument } from "../models/adminModel";

export interface IAdminRepository {
    findByEmailAndRole(email: string, role: string): Promise<IadminDocument | null>;
    getAllUsers(limit: number, offset: number, search:string): Promise<any>; 

}