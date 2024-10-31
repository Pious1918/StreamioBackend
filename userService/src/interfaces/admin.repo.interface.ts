import { IadminDocument } from "../models/adminModel";

export interface IAdminRepository {
    findByEmailAndRole(email: string, role: string): Promise<IadminDocument | null>;
    // getAllUsers(): Promise<any>;

    getAllUsers(limit: number, offset: number): Promise<any>; // Updated

}