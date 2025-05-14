import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

const secret = JWT_SECRET;
if(!secret){
    throw new Error('JWT secret is not defined in env');
}

export const generateToken = (userId:string, userType:string)=>{
    return jwt.sign({ userId, userType }, secret, { expiresIn: '1h' });
}