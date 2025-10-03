import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
if(!secret){
    throw new Error('JWT secret is not defined in env');
}

export const generateToken = (userId:string, userType:string)=>{
    return jwt.sign({ userId, userType }, secret, { expiresIn: '1h' });
}