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


// app.use('/user-service', proxy('http://user-service:5001'));


app.use(
    "/user-service",
    (req, res, next) => {
      // Apply authorization middleware only to private routes
      const publicRoutes = ["/login", "/register" ,"/adminlogin"];
      if (publicRoutes.some((route) => req.path.startsWith(route))) {
        console.log("Public route accessed in user-service:", req.path);
        return next(); // Skip authorization
      }
  
      // For private routes, apply authorization middleware
      authMiddleware.authorize(req, res, next);
    },
    proxy("http://user-service:5001")
  );
  

app.use('/video-service', authMiddleware.authorize.bind(authMiddleware), proxy('http://video-service:5002'));
app.use('/comment-service', authMiddleware.authorize.bind(authMiddleware), proxy('http://comment-service:5003'));
app.use('/live-service', authMiddleware.authorize.bind(authMiddleware), proxy('http://live-service:5005'));

// app.use('/video-service', proxy('http://video-service:5002'))

// app.use('/comment-service', proxy('http://comment-service:5003'))

// app.use('/live-service', proxy('http://live-service:5005'))


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

