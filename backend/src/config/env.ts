import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
export const JWT_SECRET=process.env.JWT_SECRET;
export const PORT=process.env.PORT;

console.log(JWT_SECRET,PORT);
console.log(process.env.JWT_SECRET,process.env.PORT);