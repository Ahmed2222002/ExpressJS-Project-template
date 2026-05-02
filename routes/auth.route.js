import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { registerValidationRules, loginValidationRules } from "../validators/auth.validator.js";
import { register, login, changePassword } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post('/register', registerValidationRules, register);
authRouter.post('/login', loginValidationRules, login);
authRouter.put('/change-password', authenticateUser, changePassword);

export { authRouter };