import express from 'express';
import cors from 'cors';
import statusRoutes from './routes/statusRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/status', statusRoutes);

export default app;