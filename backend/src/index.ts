import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();

app.use(express.json()); 


app.use(cors());
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes);

export default app;



const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


