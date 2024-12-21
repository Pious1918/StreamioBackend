import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import liveRoutes from "./routes/liveRoutes"

import morgan from "morgan"
import logger from './utils/logger'
import { Server } from 'socket.io';
import connectDB from './config/db'


dotenv.config()
connectDB()

const app = express()
const morganFormat = ":method :url :status :response-time ms";

app.use(cors({
    origin: 'https://streamio-frontend-kzuy.vercel.app', 
    credentials:true
}));



app.use(express.json());


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

app.use('/',liveRoutes)



export default app