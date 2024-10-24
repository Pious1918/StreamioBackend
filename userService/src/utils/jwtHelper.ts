
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import { IuserDocument } from '../models/userModel'
import { IadminDocument } from '../models/adminModel'

dotenv.config()

export interface IPayload{
    
        userId: string;
        name: string;
        email: string;
        role: string;
        status: string;
    
}

export interface IadminPayload{
    adminId: string;
    name:string;
    email:string;
    role:string;

}


export const generateToken = (user:IuserDocument):string =>{
    const payload : IPayload= {
        userId:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
        status:user.status
    }

    //generating the token
    return jwt.sign(payload , process.env.JWT_SECRET as string , {

        expiresIn : process.env.JWT_EXPIRY || '1h'
    })
}

export const generateAdminToken = (admin:IadminDocument):string =>{
    const payload= {
        userId:admin._id,
        email:admin.email,
        role:admin.role
    }

    //generating the token
    return jwt.sign(payload , process.env.JWT_SECRET as string , {

        expiresIn : process.env.JWT_EXPIRY || '1h'
    })
}