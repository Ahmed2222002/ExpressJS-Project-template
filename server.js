import express from 'express';
import connectDB from './config/dbConnect.js';
import { Environment } from './config/configEnvironment.js';
import { authRouter } from './routes/auth.route.js';

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// APIs
app.use('/v1/api/auth', authRouter);

app.listen(Environment.PORT, () => {
  console.log(`Server is running in ${Environment.NODE_ENV} environment on port ${Environment.PORT}`);
});