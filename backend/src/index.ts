import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import excelRouter from "./routes/excelRouter";
import schemeRouter from './routes/schemeRouter';
import facultyRouter from './routes/facultyRouter';
import assignmentRouter from './routes/assignmentRouter';
import sectionsRouter from './routes/sectionsRouter';
import scheduleRouter from './routes/scheduleRouter';
import algoRouter from './routes/algorouter';
import roomRouter from './routes/roomRouter';

dotenv.config();

const app = express();

app.use(express.json()); 

// Configure CORS properly
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/excel',excelRouter);
app.use('/api/v1/scheme',schemeRouter)
app.use('/api/v1/faculty',facultyRouter)
app.use('/api/v1/assignments', assignmentRouter)
app.use('/api/v1/sections', sectionsRouter)
app.use('/api/v1/schedule', scheduleRouter)
app.use('/api/v1/algo', algoRouter)
app.use('/api/v1/rooms', roomRouter)

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;


