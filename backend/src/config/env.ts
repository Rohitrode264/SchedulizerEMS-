import dotenv from 'dotenv';
dotenv.config({path:'../../prisma/.env'});
export const JWT_SECRET=process.env.JWT_SECRET;
export const PORT=process.env.PORT;