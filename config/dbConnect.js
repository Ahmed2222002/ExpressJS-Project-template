import mongoose from "mongoose";

function connectDB() {
    mongoose.connect(process.env.DB_URI)
        .then(() => console.log('MongoDB connected successfully'))
        .catch((err) => {
            console.error('MongoDB connection error:', err);
            process.exit(1); // Exit the process with failure
        });
}

export default connectDB;