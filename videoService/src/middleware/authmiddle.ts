import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface IPayload {
  userId: string;
  name: string;
  email: string;
  // Add any other properties you included in the JWT payload
}

export interface IAuthRequest extends Request {
  user?: IPayload; // Extend the Request interface to include user property
}

export class AuthMiddleware {
  public async authorize(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
       res.status(403).json({ error: 'No token provided' });
       return
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret) as unknown; // Cast to unknown first
      req.user = decoded as IPayload; // Now cast to IPayload

      next();
    } catch (error) {
        console.error(error)
       res.status(401).json({ error: "Unauthorized" });
       return
    }
  }
}
