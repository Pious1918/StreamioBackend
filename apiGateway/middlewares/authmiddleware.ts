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
    role?: string;
}

export class AuthMiddleware {
    private publicRoutes: string[] = ["/user-service/login", "/user-service/register", "/user-service/adminlogin"];

    private adminRoutes: string[] = [
        "/user-service/userlist",
        "/user-service/savebanner",
        "/user-service/getbanner",
        "/user-service/deletebanner",
    ]; // Define routes exclusive to admin



    public async authorize(req: IAuthRequest, res: Response, next: NextFunction): Promise<any> {

        // Check if the route is public
        if (this.isPublicRoute(req.path)) {
            console.log("Public route accessed:", req.path);
            return next();
        }

        console.log("adminhee", req.headers)

        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            console.log("hit but no token");
            return res.status(403).json({ error: 'No token provided' });
        }

        try {

            // Decode the token and determine whether it's for a user or admin
            const secret = this.isAdminRoute(req.path) ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET;

            console.log("secret is ",secret)


            if (!secret) {
                throw new Error("JWT secret not configured.");
            }

            const decoded: IPayload = jwt.verify(token, secret) as IPayload;
            req.userId = decoded.userId; // Only store userId in the request
            req.role = decoded.role; // Store the role

            console.log(`User ID: ${req.userId}, Role: ${req.role} @api-gateway`);


            // Additional role check for admin-specific routes
            if (this.isAdminRoute(req.path) && decoded.role !== "admin") {
                console.log("Access denied for non-admin user");
                return res.status(403).json({ error: "Access denied. Admins only." });
            }



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



    /**
  * Checks if a route is exclusive to admin.
  * @param path - The path of the request
  * @returns Whether the route is admin-specific
  */
    private isAdminRoute(path: string): boolean {
        return this.adminRoutes.some((route) => path.startsWith(route));
    }


}
