import express from 'express';
import { Environment } from './config/configEnvironment.js';

const app = express();

app.listen(Environment.PORT, () => {
  console.log(`Server is running in ${Environment.NODE_ENV} environment on port ${Environment.PORT}`);
});