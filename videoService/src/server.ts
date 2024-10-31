// to start the server

import app from "./app";

const port = process.env.SERVER_PORT 


app.listen (port , ()=>{
    console.log(`videoService server running on ${port}`)
})