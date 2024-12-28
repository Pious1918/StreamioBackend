import express, { NextFunction, Response } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import proxy from 'express-http-proxy'
import morgan from "morgan"
import { AuthMiddleware, IAuthRequest } from "./middlewares/authmiddleware";
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config()
const app = express()
const authMiddleware = new AuthMiddleware(); 

app.use(express.json({limit: "100mb"}));
app.use(express.static("public"))
app.use(express.json());
app.use(cors({
    origin: 'https://streamio-frontend-kzuy.vercel.app',
    credentials: true 
}))

app.use(morgan('tiny')); 

// Global Authorization Middleware with route exclusion
app.use((req: any, res: Response, next: NextFunction) => {
    const exemptedPaths = [
        "/user-service/login", // Add paths to exclude here
    ];

    if (exemptedPaths.includes(req.originalUrl)) {
        console.log(`Skipping authorization for path: ${req.originalUrl}`);
        return next(); // Skip authorization
    }

    console.log("Authorizing request...");
    authMiddleware
        .authorize(req, res, next)
        .then(() => {
            console.log(`Token validated. User ID: ${req.userId}`);
            next(); // Proceed to the next middleware if authorization succeeds
        })
        .catch((error) => {
            console.error("Authorization failed:", error);
            res.status(401).json({ error: "Unauthorized" }); // Respond with unauthorized if authorization fails
        });
});




// Proxy with userId injection
app.use("/user-service", (req:IAuthRequest, res, next) => {
    console.log(`[USER SERVICE] Forwarding request with User ID: ${req.userId}`);
    req.headers["x-user-id"] = req.userId; // Inject userId into the headers
    proxy("http://user-service:5001")(req, res, next);
});

// app.use('/user-service', proxy('http://user-service:5001'));

app.use('/video-service', proxy('http://video-service:5002'))

app.use('/comment-service', proxy('http://comment-service:5003'))

app.use('/live-service', proxy('http://live-service:5005'))


// Proxy WebSocket connections separately
app.use('/socket.io', createProxyMiddleware({
    target: 'http://live-service:5005',
    ws: true,  // This ensures WebSocket connections are handled properly
    changeOrigin: true,
  }));

const port = process.env.SERVER_PORT || 5000 


app.listen (port , ()=>{
    console.log(`Api gateway running on ${port}`)
})

