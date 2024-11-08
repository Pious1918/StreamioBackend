import { Request } from "express";



export interface IPayload{
    
    userId: string;
    name: string;
    email: string;
    role: string;
    status: string;

}

export default interface IAuthRequest extends Request  {
    user?: IPayload
}