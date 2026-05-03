import { errorResponse } from "../utils/responses";

function globalErrorMiddleware(err, req, res, next) {
    if (process.env.NODE_ENV === 'development') {
        sendErrorForDevelopment(err, res);
    } else {
        sendErrorForProduction(err, res);
    }
}

// response with full error stack in development, but only message in production

function sendErrorForDevelopment(err, res) {
    errorResponse(
        res,
        err.statusCode || 500,
        err.message || 'Internal Server Error',
        {
            stack: err.stack
        }
    );
}

function sendErrorForProduction(err, res) {
    errorResponse(
        res, 
        err.statusCode || 500, 
        'Internal Server Error'
    );
}


export default globalErrorMiddleware;