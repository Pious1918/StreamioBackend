import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';



export interface IPayload {

    userId: string;
    name: string;
    email: string;
    role: string;
    status: string;

}
export interface IAuthRequest extends Request {
    userId?: string; 
    role?: string;
}

export class AuthMiddleware {
    private publicRoutes: string[] = ["/user-service/login", "/user-service/register", "/user-service/adminlogin", "/user-service/getbanneruser", "/user-service/generateotp", "/user-service/resetpassword", "/user-service/submitotp"];

    private adminRoutes: string[] = [
        "/userlist",
        "/savebanner",
        "/deletebanner",
        "/getbanner",
        "/countuser",
        "/topfive",
        "/reportvideosAdmin",
        "/generateCommonPresigner",
        "/verifybyadmin",
        "/noticebyadmin",
    ]; 



    public async authorize(req: IAuthRequest, res: Response, next: NextFunction): Promise<any> {

        if (this.isExcludedRoute(req.path)) {
            return next(); 
        }





        
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

            const secret = this.isAdminRoute(req.path) ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET;

            if (!secret) {
                throw new Error("JWT secret not configured.");
            }

            const decoded: IPayload = jwt.verify(token, secret) as IPayload;
            req.userId = decoded.userId; 
            req.role = decoded.role; 
            console.log(`User ID: ${req.userId}, Role: ${req.role} @api-gateway`);

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


    private isPublicRoute(path: string): boolean {
        return this.publicRoutes.some((route) => path.startsWith(route));
    }

    private isAdminRoute(path: string): boolean {

        // Use regular expression to handle dynamic routes like /userds/:id/status
        return this.adminRoutes.some((route) => {
            const regex = new RegExp(`^${route.replace(':id', '\\w+')}$`);
            return regex.test(path);
        });
    }














    private isExcludedRoute(path: string): boolean {
        const regex = /^\/userds\/[^/]+\/status$/;
        return regex.test(path);
    }

}
