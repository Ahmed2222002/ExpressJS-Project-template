import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { userModel } from "../models/user.model.js";
import { successResponse, errorResponse } from "../utils/responses.js";
import { addEmailJobToQueue } from "../queues/emailQueue.js";

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

        return successResponse(
            res,
            201,
            'User registered successfully',
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

async function forgetPassword(req, res) {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            console.error(`No user found with email: ${email}`);
            // For security, we can still return a success response to prevent email enumeration
            return successResponse(res, 200, 'If an account with that email exists, a password reset email has been sent', null);
        }

        // Generate reset token and set expiration
        const resetToken = uuidv4();

        // hash the reset token before saving to the database for security
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
        await user.save();

        // Add email job to queue
        const isEmailAdded = await addEmailJobToQueue(
            'passwordResetEmail',
            {
                email: user.email,
                subject: 'Password Reset',
                html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                       <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
                       <p>This link will expire in 15 minutes.</p>`
            }
        );

        if (!isEmailAdded) {
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            return errorResponse(res, 500, 'Failed to send password reset email', null);
        }

        return successResponse(res, 200, 'If an account with that email exists, a password reset email has been sent', null);
    } catch (error) {
        return errorResponse(res, 500, 'Internal server error', null);
    }
}

async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;
        // Hash the token to compare with the database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user by reset token and check if it's still valid
        const user = await userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return errorResponse(res, 400, 'Invalid or expired reset token', null);
        }
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        // Update user's password and clear reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        return successResponse(res, 200, 'Password reset successfully', null);
    } catch (error) {
        return errorResponse(res, 500, 'Internal server error', null);
    }
}



export {
    register,
    login,
    changePassword,
    forgetPassword,
    resetPassword
}