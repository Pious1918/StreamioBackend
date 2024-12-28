import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { StatusCodes } from '../enums/statusCode.enums';


dotenv.config();

export interface IPayload {
  userId: string;
  name: string;
  email: string;
}

export interface IAuthRequest extends Request {
  user?: IPayload;
}




export class AuthMiddleware {


  public async authorize(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {

      res.status(StatusCodes.FORBIDDEN).json({ error: 'No token provided' });
      return

    }

    try {

      const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret) as unknown; // Cast to unknown first
      req.user = decoded as IPayload; // Now cast to IPayload
      next();

    } catch (error) {

      console.error(error)
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return

    }

  }


}
