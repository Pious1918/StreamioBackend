// to start the server

import app from "./app";
import { startWorker } from "./workers/videoworker";

const port = process.env.SERVER_PORT 

startWorker().catch(console.error)
app.listen (port , ()=>{
    console.log(`videoService server running on ${port}`)
})