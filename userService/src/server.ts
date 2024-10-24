// to start the server

import app from "./app";

const port = process.env.SERVER_PORT || 5002


app.listen (port , ()=>{
    console.log(`UserService server running on ${port}`)
})