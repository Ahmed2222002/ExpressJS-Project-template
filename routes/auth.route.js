import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
    registerValidationRules,
    loginValidationRules,
    changePasswordValidationRules,
    forgetPasswordValidationRules,
    resetPasswordValidationRules
} from "../validators/auth.validator.js";
import {
    register,
    login,
    changePassword,
    forgetPassword,
    resetPassword
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post('/register', registerValidationRules, register);
authRouter.post('/login', loginValidationRules, login);
authRouter.put('/change-password', authenticateUser, changePasswordValidationRules, changePassword);
authRouter.post('/forget-password', forgetPasswordValidationRules, forgetPassword);
authRouter.post('/reset-password', resetPasswordValidationRules, resetPassword);

export { authRouter };