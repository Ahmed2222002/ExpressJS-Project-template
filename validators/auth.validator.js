import { check } from "express-validator";
import { validationMiddleware } from "../middlewares/validationMiddleWare.js";

const registerValidationRules = [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validationMiddleware
];

const loginValidationRules = [
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').notEmpty().withMessage('Password is required'),
    validationMiddleware
];

const changePasswordValidationRules = [
    check('oldPassword').notEmpty().withMessage('Old password is required'),
    check('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    validationMiddleware
];

const forgetPasswordValidationRules = [
    check('email').isEmail().withMessage('Valid email is required'),
    validationMiddleware
];

const resetPasswordValidationRules = [
    check('token').notEmpty().withMessage('Reset token is required'),
    check('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    validationMiddleware
];

export {
    registerValidationRules,
    loginValidationRules,
    changePasswordValidationRules,
    forgetPasswordValidationRules,
    resetPasswordValidationRules
};