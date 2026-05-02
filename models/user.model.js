import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin']
    },
    resetPasswordToken: {
        type: String,
        trim: true,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        trim: true,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const userModel = mongoose.model('User', userSchema);

export { userModel };