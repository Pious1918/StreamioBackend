// to configure and initializing the express app 

import express from "express"
import cors from "cors";
import dotenv from 'dotenv'
import connectDB from "./config/db"

import videoRoutes from "./routes/videoRoutes"
import morgan from "morgan"
import logger from "./utils/logger";
import path from "path";
// import path from "path";
// import { errorMiddleware } from "./middlewares/errorMiddleware";
dotenv.config()
connectDB()

const app = express()

const morganFormat = ":method :url :status :response-time ms";
// morganFormat says that I want to have the method, url , status and response in milli s

app.use(express.json());
app.use(cors({
  origin: '*', // or specify your frontend's URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => {
          const logObject = {
            method: message.split(" ")[0],
            url: message.split(" ")[1],
            status: message.split(" ")[2],
            responseTime: message.split(" ")[3],
          };
          logger.info(JSON.stringify(logObject));
        },
      },
    })
  );


  app.use('/',videoRoutes)
// Serve HLS files as static content
// Serve HLS files
app.use('/hls', express.static(path.resolve(__dirname, '../../hls')), (req, res, next) => {
  console.log('Serving:', req.path);
  next();
});

// function addnumb(num1:any , num2:number){
//     return num1+num2
// }

// addnumb(10,15)



export default app;