import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';
import connectDB from './config/dbConnect.js';
import redis from './config/redisConnect.js';
import globalErrorMiddleware from './middlewares/globalErrorMiddleware.js';
import { Environment } from './config/configEnvironment.js';
import { authRouter } from './routes/auth.route.js';
import { emailQueue } from './queues/emailQueue.js';
import { emailWorker } from './workers/emailWorker.js';
import { errorResponse } from './utils/responses.js';

// Connect to MongoDB
connectDB();

const app = express();

// HTTP request logging
morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
})

app.use(morgan);

app.use(cors(
  {
    origin: Environment.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
))
// compress all responses for better performance
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// APIs
app.use('/v1/api/auth', authRouter);

// global error handling
app.use(globalErrorMiddleware);

app.listen(Environment.PORT, () => {
  console.log(`Server is running in ${Environment.NODE_ENV} environment on port ${Environment.PORT}`);
});



// Graceful shutdown for email worker and Redis connection
process.on("SIGINT", async () => {
    await emailWorker.close();
    await emailQueue.close();
    await redis.quit();
    process.exit(0);
});

// handle Error outside express
process.on("unhandledRejection", (err) => {
  console.log(`unhandledRejection error: ${err}`);
  server.close(() => {
    console.log("server shutting down...");
    process.exit(1);
  });
});