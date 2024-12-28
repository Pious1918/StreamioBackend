// authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// import { IPayload } from '../utils/jwtHelper';

export interface IPayload {

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
    private publicRoutes: string[] = ["/user-service/login", "/user-service/register"];

    public async authorize(req: IAuthRequest, res: Response, next: NextFunction): Promise<any> {

        // Check if the route is public
        if (this.isPublicRoute(req.path)) {
            console.log("Public route accessed:", req.path);
            return next();
        }

        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            console.log("hit but no token");
            return res.status(403).json({ error: 'No token provided' });
        }

        try {
            const decoded: IPayload = jwt.verify(token, process.env.JWT_SECRET as string) as IPayload;
            req.userId = decoded.userId; // Only store userId in the request

            console.log("User ID extracted @apigate:", req.userId);
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

  /**
   * Checks if a route is public.
   * @param path - The path of the request
   * @returns Whether the route is public
   */
  private isPublicRoute(path: string): boolean {
    return this.publicRoutes.some((route) => path.startsWith(route));
  }


}
