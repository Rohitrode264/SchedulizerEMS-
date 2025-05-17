import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import excelRouter from "./routes/excelRouter";
import cors from 'cors'; 
dotenv.config();

const app = express();

app.use(express.json()); 
app.use(cors({
  origin: 'http://localhost:5173', // replace with your frontend URL
  credentials: true, // if using cookies or auth headers
}));
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/excel',excelRouter)
export default app;



const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});