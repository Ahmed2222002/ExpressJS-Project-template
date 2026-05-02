import { validationResult } from "express-validator";
import { errorResponse } from "../utils/responses.js";
import fs from "fs";

function validationMiddleware(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        // If there's an uploaded file, remove it since validation failed
        if (req.file) {
            const filePath = req.file.path
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("Error deleting uploaded file after validation failure:", err);
                } else {
                    console.log("Uploaded file deleted successfully after validation failure");
                }
            });
        }

        return errorResponse(res, 400, `${errors.array()[0].msg}`, errors.array());
    }
    next();
}

export { validationMiddleware };
