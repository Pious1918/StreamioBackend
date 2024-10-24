import { NextFunction, Request, response, Response } from "express";


interface CustomError{

    status:number,
    message:string;
    
}



export function errorMiddleware( err: CustomError,req:Request , res: Response , next:NextFunction){
    const statusCode = err.status || 500
    const message = err.message || 'internal server error'

    console.log(`Error: ${message} , Status Code : ${statusCode}`)

    res.status(statusCode).json({
        success:false,
        message:message
    })
}
