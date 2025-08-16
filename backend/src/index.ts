import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import excelRouter from "./routes/excelRouter";
import schemeRouter from './routes/schemeRouter';
import facultyRouter from './routes/facultyRouter';
import assignmentRouter from './routes/assignmentRouter';
import sectionsRouter from './routes/sectionsRouter';

dotenv.config();

const app = express();

app.use(express.json()); 


app.use(cors());
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/excel',excelRouter);
app.use('/api/v1/scheme',schemeRouter)
app.use('/api/v1/faculty',facultyRouter)
app.use('/api/v1/assignments', assignmentRouter)
app.use('/api/v1/sections', sectionsRouter)

export default app;



const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


