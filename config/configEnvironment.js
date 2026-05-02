import dotenv from 'dotenv';

dotenv.config({
    path: `.env.${process.env.NODE_ENV || 'development'}`
});

const Environment = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    DB_URI: process.env.DB_URI || 'mongodb://localhost:27017/expressjs-template'
};

export { Environment };
