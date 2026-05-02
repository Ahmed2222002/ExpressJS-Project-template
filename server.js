import express from 'express';
import connectDB from './config/dbConnect.js';
import { Environment } from './config/configEnvironment.js';

const app = express();

// Connect to MongoDB
connectDB();

app.listen(Environment.PORT, () => {
  console.log(`Server is running in ${Environment.NODE_ENV} environment on port ${Environment.PORT}`);
});