import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { generateRefreshToken, generateToken, verifyRefreshToken } from './jwtHelper';
import userModel from '../models/userModel';
import { IuserDocument } from '../models/userModel'

dotenv.config();

export const refreshTokenHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;


    console.log("refreshTOKEN",refreshToken)
    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        // Verifying the refresh token
        const decoded = verifyRefreshToken(refreshToken);
        const userId = decoded.userId;

        // Checking if the user exists and is active
        const user = await userModel.findById(userId);
        if (!user || user.status?.toLowerCase() !== 'active') {
            return res.status(403).json({ message: 'User not found or inactive' });
        }

        // Generating a new access token
        const newAccessToken = generateToken(user);

        return res.status(200).json({ accessToken: newAccessToken});

    } catch (error) {
        // Handle any errors
        next(error); // Call the next middleware with the error
    }
};

