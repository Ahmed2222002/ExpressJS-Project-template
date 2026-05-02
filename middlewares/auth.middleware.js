import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responses.js';
import { userModel } from '../models/user.model.js';

async function authenticateUser(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1] || null;

        if (!token) {
            return errorResponse(res, 401, 'Access token is missing', null);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //check if user exists
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return errorResponse(res, 404, 'User not found', null);
        }

        req.user = user;
        next();
    } catch (error) {
        return errorResponse(res, 401, 'Invalid access token', null);
    }
}

function authorizeRoles(roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return errorResponse(res, 403, 'Forbidden: You do not have permission to access this resource', null);
        }
        next();
    };
}

export { authenticateUser, authorizeRoles };