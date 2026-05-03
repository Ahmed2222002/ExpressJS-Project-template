function globalErrorMiddleware(err, req, res, next) {
    if (process.env.NODE_ENV === 'development') {
        sendErrorForDevelopment(err, res);
    } else {
        sendErrorForProduction(err, res);
    }
}

function sendErrorForDevelopment(err, res) {
    res.status(500).json({
        status: 'error',
        message: err.message,
        stack: err.stack
    });
}

function sendErrorForProduction(err, res) {
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
    });
}

export default globalErrorMiddleware;