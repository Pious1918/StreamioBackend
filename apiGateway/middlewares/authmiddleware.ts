// authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// import { IPayload } from '../utils/jwtHelper';

export interface IPayload{
    
    userId: string;
    name: string;
    email: string;
    role: string;
    status: string;

}
export interface IAuthRequest extends Request {
    userId?: string; // Changed to only store userId
}

export class AuthMiddleware {
    // Middleware method for authentication
    public async authorize(req: IAuthRequest, res: Response, next: NextFunction): Promise<any> {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            console.log("hit but no token");
            return res.status(403).json({ error: 'No token provided' });
        }

        try {
            const decoded: IPayload = jwt.verify(token, process.env.JWT_SECRET as string) as IPayload;
            req.userId = decoded.userId; // Only store userId in the request

            console.log("User ID extracted:", req.userId);
            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                console.log("token expired");
                return res.status(401).json({ message: 'Token expired' });
            }
            console.error("Error in authorization:", error);
            return res.status(401).json({ error: "Unauthorized" });
        }
    }
}
