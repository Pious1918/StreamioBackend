


import express from "express";

import dotenv from 'dotenv';
import cors from 'cors';

import proxy from 'express-http-proxy'
import morgan from "morgan"

dotenv.config()

const app = express()
app.use(express.json({limit: "100mb"}));
app.use(express.static("public"))
app.use(express.json());
app.use(cors({
    origin:'http://localhost:4200'
}))
app.use(morgan('tiny')); // Use morgan to log incoming requests to the API gateway
// app.use('/user-service', proxy('http://user-service:5001'));
app.use('/user-service', proxy('http://localhost:5001'));

  

const port = process.env.SERVER_PORT || 5000


app.listen (port , ()=>{
    console.log(`Api gateway running on ${port}`)
})