import express from "express"
import cors from "cors";
import dotenv from 'dotenv'
import connectDB from "./config/db"
import videoRoutes from "./routes/videoRoutes"
import morgan from "morgan"
import logger from "./utils/logger";
import path from "path";


dotenv.config()
connectDB()
const app = express()

const morganFormat = ":method :url :status :response-time ms";
const pathName = path.join(__dirname, '../public')
console.log(pathName)
app.use(cors({
  origin: 'https://streamio-frontend-kzuy.vercel.app',
}));
app.use(express.static(pathName));
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


app.use('/', videoRoutes)

export default app;