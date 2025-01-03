import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import userModel from '../models/userModel';
import { IPayload } from '../utils/jwtHelper';
import { StatusCodes } from '../enums/statusCode.enums';
dotenv.config();

export default interface IAuthRequest extends Request  {
    user?: IPayload
}

export class Middleware {

    // Middleware method for authentication
    public async authorize(req: IAuthRequest, res: Response, next: NextFunction): Promise<any> {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            console.log("hit but no token")
            return res.status(403).json({ error: 'No token provided' });
        }

        try {

            const decoded: IPayload = jwt.verify(token, process.env.JWT_SECRET as string) as IPayload;
            req.user = {
                userId: decoded.userId,
                name: decoded.name,
                email: decoded.email,
                role: decoded.role,
                status: decoded.status
            }; 
        
            const userId = (decoded as any).userId;
            const userDetails:any = await userModel.findById(userId);
            console.log("hit in the middle");

            if (!userDetails) {
                res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });   
            }

            if (userDetails.status?.trim().toLowerCase() !== 'active') {
                console.log("User is blocked or inactive");
                res.status(StatusCodes.FORBIDDEN).json({ message: 'User is blocked' });
                return;
            }
            // If the user is active, proceed to the next middleware or route handler
            console.log("User is active, proceeding...");
            next();
        } catch (error) {

            if(error instanceof jwt.TokenExpiredError){
                console.log("token expired")
                return res.status(401).json({ message: 'Token expired' });

            }
            
            console.log("hit but no token")
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
            
        }
    }



    public async adminAuthorize(req:Request , res:Response , next:NextFunction):Promise<any>{
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            console.log("hit but no token")
            res.status(StatusCodes.FORBIDDEN).json({ error: 'No token provided' });
            return;
        }

        console.log(`token is ${token} , req ${req}`)
        next()
    }



}

