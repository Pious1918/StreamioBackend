import express from "express"
import cors from "cors";
import dotenv from 'dotenv'
import connectDB from "./config/db"
import cookieParser from 'cookie-parser';
import userRoutes from "./routes/userRoute"
import morgan from "morgan"
import logger from "./utils/logger";
import { errorMiddleware } from "./middlewares/errorMiddleware";
dotenv.config()
connectDB()

const app = express()

const morganFormat = ":method :url :status :response-time ms";

app.use(express.json());
app.use(cors())


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

app.use(cookieParser());
app.use("/", userRoutes);  

app.use(errorMiddleware)

export default app;