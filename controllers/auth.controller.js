import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";
import { successResponse, errorResponse } from "../utils/responses.js";

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return errorResponse(res, 400, 'User already exists', null);
        }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user
        const user = await userModel.create({
            name,
            email,
            password: hashedPassword
        });

        // Generate a token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        return successResponse(res, 201, 'User registered successfully', { token });
    } catch (error) {
        return errorResponse(res, 500, 'Internal server error', null);
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return errorResponse(res, 400, 'Invalid email or password', null);
        }
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return errorResponse(res, 400, 'Invalid email or password', null);
        }
        // Generate a token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );
        return successResponse(
            res,
            200,
            'User logged in successfully',
            {
                token,
                user:
                {
                    id:
                        user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive
                }
            }
        );
    } catch (error) {
        return errorResponse(res, 500, 'Internal server error', null);
    }
}

async function changePassword(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;

        const userId = req.user.id;

        const user = await userModel.findById(userId);

        // Check if old password is correct
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return errorResponse(res, 400, 'Invalid old password', null);
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        return successResponse(res, 200, 'Password changed successfully', null);
    } catch (error) {
        return errorResponse(res, 500, 'Internal server error', null);
    }
}



export {
    register,
    login,
    changePassword
}