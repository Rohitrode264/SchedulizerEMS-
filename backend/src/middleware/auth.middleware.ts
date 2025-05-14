import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";


interface AuthRequest extends Request {
    user?: any;
  }

export const verifyToken:RequestHandler= (req:AuthRequest, res:Response, next:NextFunction)=>{
    const token=req.header('Authorization');
    const secret = JWT_SECRET;

    if(!secret){
        throw new Error('JWT secret is not defined in env');
    }

    if(!token){
        res.status(401).json({Message:"No Token Provided"});
    }

    try{
        if(token){
        const decoded= jwt.verify(token,secret);
        req.user=decoded;
        next();
    }
    else{
        res.status(401).json({Message:"No Token Provided"});
    }
    }
    catch(e){
         res.status(401).json({
            message:"Invalid or expired token"
        });
    }
}